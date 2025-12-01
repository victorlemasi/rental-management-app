import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import Tenant from '../models/Tenant.js';
import Property from '../models/Property.js';
import { User } from '../models/User.js';
import { auth, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get current tenant profile - Accessible by any authenticated user (but logic restricts to self)
router.get('/me', auth, async (req: any, res: Response) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const tenant = await Tenant.findOne({ email: user.email }).populate('propertyId');
        if (!tenant) {
            return res.status(404).json({ message: 'Tenant profile not found' });
        }
        res.json(tenant);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching tenant profile', error });
    }
});

// Get all tenants - Admin/Manager only
router.get('/', auth, authorize(['admin', 'manager']), async (req: Request, res: Response) => {
    try {
        // Find properties owned by the user
        const properties = await Property.find({ user: (req as any).user.userId });
        const propertyIds = properties.map(p => p._id);

        const tenants = await Tenant.find({ propertyId: { $in: propertyIds } })
            .populate('propertyId')
            .sort({ createdAt: -1 });

        // Check and update balances for new month
        const currentMonth = new Date().toISOString().slice(0, 7);
        const updates = tenants.map(async (tenant) => {
            if (tenant.currentMonth !== currentMonth && tenant.paymentStatus !== 'paid') {
                // New month started and previous month wasn't fully paid
                await Tenant.findByIdAndUpdate(tenant._id, {
                    balance: tenant.monthlyRent,
                    currentMonth: currentMonth,
                    paymentStatus: 'pending'
                });
                // Update the tenant object for response
                tenant.balance = tenant.monthlyRent;
                tenant.currentMonth = currentMonth;
                tenant.paymentStatus = 'pending';
            }
        });
        await Promise.all(updates);

        res.json(tenants);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching tenants', error });
    }
});

// Get single tenant - Admin/Manager only (Tenant uses /me)
router.get('/:id', auth, authorize(['admin', 'manager']), async (req: Request, res: Response) => {
    try {
        const tenant = await Tenant.findById(req.params.id).populate('propertyId');
        if (!tenant) {
            return res.status(404).json({ message: 'Tenant not found' });
        }

        // Check ownership
        const property = await Property.findOne({ _id: tenant.propertyId, user: (req as any).user.userId });
        if (!property) {
            return res.status(403).json({ message: 'Access denied' });
        }

        res.json(tenant);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching tenant', error });
    }
});

// Create tenant - Admin/Manager only
router.post('/', auth, authorize(['admin', 'manager']), async (req: Request, res: Response) => {
    let userCreated = false;
    let userId = null;

    try {
        // Check property ownership
        const property = await Property.findOne({ _id: req.body.propertyId, user: (req as any).user.userId });
        if (!property) {
            return res.status(400).json({ message: 'Invalid property or access denied' });
        }

        // 1. Check if user already exists
        let user = await User.findOne({ email: req.body.email });

        if (user) {
            // User exists - check if it's a dangling tenant user
            if (user.role !== 'tenant') {
                return res.status(400).json({ message: 'User with this email already exists and is not a tenant' });
            }

            // Check if tenant profile already exists
            const existingTenant = await Tenant.findOne({ email: req.body.email });
            if (existingTenant) {
                return res.status(400).json({ message: 'Tenant with this email already exists' });
            }

            // If we get here, User exists (role=tenant) but Tenant doesn't. 
            // We proceed to create the Tenant profile (Recovery mode).
        } else {
            // 2. Create User account
            const password = req.body.password || 'tenant123'; // Use provided password or default
            const hashedPassword = await bcrypt.hash(password, 8);

            user = new User({
                name: req.body.name,
                email: req.body.email,
                password: hashedPassword,
                role: 'tenant'
            });
            await user.save();
            userCreated = true;
            userId = user._id;
        }

        // 3. Create Tenant profile
        // Initialize balance with monthly rent if not provided
        const tenantData = {
            ...req.body,
            balance: req.body.balance !== undefined ? req.body.balance : req.body.monthlyRent
        };
        const tenant = new Tenant(tenantData);
        const savedTenant = await tenant.save();

        res.status(201).json({ tenant: savedTenant, message: 'Tenant created successfully' });
    } catch (error) {
        console.error('Error creating tenant:', error);

        // Rollback: Delete user if we just created it and tenant creation failed
        if (userCreated && userId) {
            try {
                await User.findByIdAndDelete(userId);
                console.log('Rolled back user creation due to tenant creation failure');
            } catch (rollbackError) {
                console.error('Error rolling back user creation:', rollbackError);
            }
        }

        res.status(400).json({ message: 'Error creating tenant', error });
    }
});

// Update tenant - Admin/Manager only
router.put('/:id', auth, authorize(['admin', 'manager']), async (req: Request, res: Response) => {
    try {
        const existingTenant = await Tenant.findById(req.params.id);
        if (!existingTenant) {
            return res.status(404).json({ message: 'Tenant not found' });
        }

        // Check ownership of current property
        const currentProperty = await Property.findOne({ _id: existingTenant.propertyId, user: (req as any).user.userId });
        if (!currentProperty) {
            return res.status(403).json({ message: 'Access denied' });
        }

        // If changing property, check ownership of new property
        if (req.body.propertyId && req.body.propertyId !== existingTenant.propertyId.toString()) {
            const newProperty = await Property.findOne({ _id: req.body.propertyId, user: (req as any).user.userId });
            if (!newProperty) {
                return res.status(400).json({ message: 'Invalid new property or access denied' });
            }
        }

        const tenant = await Tenant.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        res.json(tenant);
    } catch (error) {
        res.status(400).json({ message: 'Error updating tenant', error });
    }
});

// Delete tenant - Admin/Manager only
router.delete('/:id', auth, authorize(['admin', 'manager']), async (req: Request, res: Response) => {
    try {
        const tenant = await Tenant.findById(req.params.id);
        if (!tenant) {
            return res.status(404).json({ message: 'Tenant not found' });
        }

        // Check ownership
        const property = await Property.findOne({ _id: tenant.propertyId, user: (req as any).user.userId });
        if (!property) {
            return res.status(403).json({ message: 'Access denied' });
        }

        await Tenant.findByIdAndDelete(req.params.id);
        res.json({ message: 'Tenant deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting tenant', error });
    }
});

export default router;
