import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import Tenant from '../models/Tenant.js';
import Property from '../models/Property.js';
import { User } from '../models/User.js';
import RentHistory from '../models/RentHistory.js';
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

        // Logic for lazy rent generation removed to prevent double-charging and errors. 
        // Rent generation is handled by the cron job or manual trigger.

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

        // Create initial RentHistory record for current month (Adjust for EAT: UTC+3)
        const now = new Date();
        const eatDate = new Date(now.getTime() + (3 * 60 * 60 * 1000));
        const currentMonth = eatDate.toISOString().slice(0, 7);
        const dueDate = new Date();
        dueDate.setDate(5); // Due on the 5th
        if (dueDate < new Date()) {
            dueDate.setMonth(dueDate.getMonth() + 1);
        }

        await RentHistory.create({
            tenantId: savedTenant._id,
            propertyId: savedTenant.propertyId,
            month: currentMonth,
            amount: savedTenant.monthlyRent,
            amountPaid: 0,
            previousBalance: 0,
            creditBalance: 0,
            carriedForwardAmount: savedTenant.monthlyRent,
            status: 'pending',
            dueDate: dueDate
        });

        // Update tenant with current month
        savedTenant.currentMonth = currentMonth;
        await savedTenant.save();

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

// Get tenant rent history
router.get('/:id/rent-history', auth, async (req: Request, res: Response) => {
    try {
        const tenant = await Tenant.findById(req.params.id);
        if (!tenant) {
            return res.status(404).json({ message: 'Tenant not found' });
        }

        // Check access rights (Admin/Manager or the tenant themselves)
        const isAdminOrManager = ['admin', 'manager'].includes((req as any).user.role);

        // For tenants, check if they're requesting their own data
        let isSelf = false;
        if ((req as any).user.role === 'tenant') {
            // Get the user from JWT to compare email
            const user = await User.findById((req as any).user.userId);
            isSelf = user?.email === tenant.email;
        }

        if (!isSelf && !isAdminOrManager) {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Fetch rent history for the last 12 months
        const rentHistory = await RentHistory.find({ tenantId: tenant._id })
            .sort({ month: -1 })
            .limit(12);

        res.json(rentHistory);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching rent history', error });
    }
});

// Update rent history (utilities) - Admin/Manager only
router.put('/:id/rent-history/:historyId', auth, authorize(['admin', 'manager']), async (req: Request, res: Response) => {
    try {
        const tenant = await Tenant.findById(req.params.id);
        if (!tenant) {
            return res.status(404).json({ message: 'Tenant not found' });
        }

        const rentHistory = await RentHistory.findOne({ _id: req.params.historyId, tenantId: tenant._id });
        if (!rentHistory) {
            return res.status(404).json({ message: 'Rent history record not found' });
        }

        // Check ownership (via tenant's property)
        const property = await Property.findOne({ _id: tenant.propertyId, user: (req as any).user.userId });
        if (!property) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const { water, electricity, garbage, security } = req.body;

        // Calculate old total utilities
        const oldUtilities = rentHistory.water + rentHistory.electricity + rentHistory.garbage + (rentHistory.security || 0);

        // Calculate base rent (Total Amount - Old Utilities)
        const baseRent = rentHistory.amount - oldUtilities;

        // Update fields
        if (water !== undefined) rentHistory.water = Number(water);
        if (electricity !== undefined) rentHistory.electricity = Number(electricity);
        if (garbage !== undefined) rentHistory.garbage = Number(garbage);
        if (security !== undefined) rentHistory.security = Number(security);

        // Calculate new total utilities
        const newUtilities = rentHistory.water + rentHistory.electricity + rentHistory.garbage + (rentHistory.security || 0);

        // Update total amount
        rentHistory.amount = baseRent + newUtilities;

        await rentHistory.save();

        // Update Tenant Balance
        // The difference in amount should be added/subtracted from the balance
        const difference = newUtilities - oldUtilities;
        tenant.balance += difference;
        await tenant.save();

        res.json(rentHistory);
    } catch (error) {
        res.status(500).json({ message: 'Error updating rent history', error });
    }
});

// Upsert current month utilities - Admin/Manager only
router.post('/:id/rent-history/current', auth, authorize(['admin', 'manager']), async (req: Request, res: Response) => {
    try {
        const tenant = await Tenant.findById(req.params.id);
        if (!tenant) {
            return res.status(404).json({ message: 'Tenant not found' });
        }

        // Check ownership (via tenant's property)
        const property = await Property.findOne({ _id: tenant.propertyId, user: (req as any).user.userId });
        if (!property) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const { water, electricity, garbage, security } = req.body;
        // Use the actual calendar month to ensure we are updating the current period (Adjust for EAT: UTC+3)
        const now = new Date();
        const eatDate = new Date(now.getTime() + (3 * 60 * 60 * 1000));
        const currentMonth = eatDate.toISOString().slice(0, 7);

        // Try to find existing record for the ACTUAL current month
        let rentHistory = await RentHistory.findOne({ tenantId: tenant._id, month: currentMonth });

        // If no record for current month, look for the most recent pending/partial record
        if (!rentHistory) {
            rentHistory = await RentHistory.findOne({
                tenantId: tenant._id,
                status: { $in: ['pending', 'partial'] }
            }).sort({ month: -1 });
        }

        if (rentHistory) {
            // Update existing record
            const oldTotalAmount = rentHistory.amount;

            rentHistory.water = Number(water) || 0;
            rentHistory.electricity = Number(electricity) || 0;
            rentHistory.garbage = Number(garbage) || 0;
            rentHistory.security = Number(security) || 0;

            const newUtilities = rentHistory.water + rentHistory.electricity + rentHistory.garbage + rentHistory.security;

            // Always recalculate total from Tenant's Base Rent + New Utilities
            rentHistory.amount = tenant.monthlyRent + newUtilities;
            // Update carried forward amount (base + utilities + arrears - credits)
            const totalBeforeCredit = rentHistory.amount + rentHistory.previousBalance;
            rentHistory.carriedForwardAmount = Math.max(0, totalBeforeCredit - rentHistory.creditBalance);

            await rentHistory.save();

            // Update tenant balance by the difference in TOTAL amount
            const difference = rentHistory.amount - oldTotalAmount;
            tenant.balance += difference;
            await tenant.save();
        } else {
            // Create new record for current month
            const dueDate = new Date();
            dueDate.setDate(5); // Due on the 5th of the month
            if (dueDate < new Date()) {
                dueDate.setMonth(dueDate.getMonth() + 1); // Next month if already past due date
            }

            const utilities = (Number(water) || 0) + (Number(electricity) || 0) + (Number(garbage) || 0) + (Number(security) || 0);
            const totalAmount = tenant.monthlyRent + utilities;

            // Check if we should add the full amount or just utilities
            // If tenant was created this month AND balance equals monthly rent
            // Then rent is likely already in the balance (from creation)
            const createdDate = new Date(tenant.createdAt);
            const isCreatedThisMonth = createdDate.toISOString().slice(0, 7) === currentMonth;

            let amountToAdd = totalAmount;

            // If rent is already in balance (new tenant case), only add utilities
            if (isCreatedThisMonth && Math.abs(tenant.balance - tenant.monthlyRent) < 1) {
                amountToAdd = utilities;
            }

            rentHistory = await RentHistory.create({
                tenantId: tenant._id,
                propertyId: tenant.propertyId,
                month: currentMonth,
                amount: totalAmount,
                amountPaid: 0,
                previousBalance: 0,
                creditBalance: 0,
                carriedForwardAmount: totalAmount,
                status: 'pending',
                dueDate: dueDate,
                water: Number(water) || 0,
                electricity: Number(electricity) || 0,
                garbage: Number(garbage) || 0,
                security: Number(security) || 0
            });

            // Update tenant balance and current month
            tenant.balance += amountToAdd;
            tenant.currentMonth = currentMonth;
            await tenant.save();
        }

        res.json(rentHistory);
    } catch (error) {
        res.status(500).json({ message: 'Error updating utilities', error });
    }
});

// Record payment - Admin/Manager only
router.post('/:id/record-payment', auth, authorize(['admin', 'manager']), async (req: Request, res: Response) => {
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

        const { amount, month, transactionId } = req.body;
        const paymentAmount = Number(amount);

        if (!amount || paymentAmount <= 0) {
            return res.status(400).json({ message: 'Invalid payment amount' });
        }

        // If month is provided, record for specific month. Otherwise use current month (Adjust for EAT: UTC+3)
        const now = new Date();
        const eatDate = new Date(now.getTime() + (3 * 60 * 60 * 1000));
        const currentMonth = eatDate.toISOString().slice(0, 7);
        const targetMonth = month || tenant.currentMonth || currentMonth;

        // Find or create rent history for the target month
        let rentHistory = await RentHistory.findOne({ tenantId: tenant._id, month: targetMonth });

        if (!rentHistory) {
            return res.status(404).json({ message: 'Rent record not found for this month' });
        }

        // Calculate amounts (use carriedForwardAmount which includes arrears)
        const previousAmountPaid = rentHistory.amountPaid;
        const newTotalPaid = previousAmountPaid + paymentAmount;
        const amountDue = rentHistory.carriedForwardAmount; // Use total including arrears
        const remainingBalance = amountDue - newTotalPaid;

        // Update rent history
        rentHistory.amountPaid = newTotalPaid;

        // Update status based on payment (check against total including arrears)
        if (newTotalPaid >= rentHistory.carriedForwardAmount) {
            rentHistory.status = 'paid';
        } else if (newTotalPaid > 0) {
            rentHistory.status = 'partial';
        }

        await rentHistory.save();

        // Update tenant balance (negative balance = overpayment/credit)
        tenant.balance = tenant.balance - paymentAmount;

        // Update payment status based on overall balance
        if (tenant.balance <= 0) {
            tenant.paymentStatus = 'paid';
        } else if (tenant.balance < tenant.monthlyRent) {
            tenant.paymentStatus = 'partial';
        } else {
            tenant.paymentStatus = 'overdue';
        }

        await tenant.save();

        res.json({
            success: true,
            message: 'Payment recorded successfully',
            rentHistory,
            tenant: {
                balance: tenant.balance,
                paymentStatus: tenant.paymentStatus
            },
            paymentDetails: {
                amountPaid: paymentAmount,
                monthTotal: newTotalPaid,
                monthDue: amountDue,
                monthRemaining: remainingBalance,
                overallBalance: tenant.balance
            }
        });
    } catch (error) {
        console.error('Payment recording error:', error);
        res.status(500).json({ message: 'Error recording payment', error });
    }
});

// Extend lease period - Admin/Manager only
router.post('/:id/extend-lease', auth, authorize(['admin', 'manager']), async (req: Request, res: Response) => {
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

        const { months } = req.body;

        if (!months || months <= 0) {
            return res.status(400).json({ message: 'Invalid number of months. Must be greater than 0.' });
        }

        // Get current lease end date
        const currentLeaseEnd = new Date(tenant.leaseEnd);

        // Add months to lease end date
        const newLeaseEnd = new Date(currentLeaseEnd);
        newLeaseEnd.setMonth(newLeaseEnd.getMonth() + Number(months));

        // Update tenant
        tenant.leaseEnd = newLeaseEnd;
        await tenant.save();

        res.json({
            success: true,
            message: `Lease extended by ${months} month(s) successfully`,
            tenant,
            previousLeaseEnd: currentLeaseEnd,
            newLeaseEnd: newLeaseEnd
        });
    } catch (error) {
        console.error('Error extending lease:', error);
        res.status(500).json({ message: 'Error extending lease period', error });
    }
});

export default router;
