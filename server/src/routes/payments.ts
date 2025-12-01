import express, { Request, Response } from 'express';
import Payment from '../models/Payment.js';
import Tenant from '../models/Tenant.js';
import Property from '../models/Property.js';
import { auth, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get all payments - Admin/Manager only
router.get('/', auth, authorize(['admin', 'manager']), async (req: Request, res: Response) => {
    try {
        // Find properties owned by the user
        const properties = await Property.find({ user: (req as any).user.userId });
        const propertyIds = properties.map(p => p._id);

        // Find tenants in those properties
        const tenants = await Tenant.find({ propertyId: { $in: propertyIds } });
        const tenantIds = tenants.map(t => t._id);

        const payments = await Payment.find({ tenantId: { $in: tenantIds } })
            .populate('tenantId')
            .sort({ date: -1 });
        res.json(payments);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching payments', error });
    }
});

// Get single payment - Admin/Manager only
router.get('/:id', auth, authorize(['admin', 'manager']), async (req: Request, res: Response) => {
    try {
        const payment = await Payment.findById(req.params.id).populate('tenantId');
        if (!payment) {
            return res.status(404).json({ message: 'Payment not found' });
        }

        // Check ownership
        const tenant = await Tenant.findById(payment.tenantId);
        if (!tenant) {
            // Should not happen if referential integrity is maintained, but possible
            return res.status(404).json({ message: 'Tenant not found for this payment' });
        }

        const property = await Property.findOne({ _id: tenant.propertyId, user: (req as any).user.userId });
        if (!property) {
            return res.status(403).json({ message: 'Access denied' });
        }

        res.json(payment);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching payment', error });
    }
});

// Create payment - Admin/Manager only
router.post('/', auth, authorize(['admin', 'manager']), async (req: Request, res: Response) => {
    try {
        // Check ownership of tenant
        const tenant = await Tenant.findById(req.body.tenantId);
        if (!tenant) {
            return res.status(404).json({ message: 'Tenant not found' });
        }

        const property = await Property.findOne({ _id: tenant.propertyId, user: (req as any).user.userId });
        if (!property) {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Create payment with tenant and property names populated
        const paymentData = {
            ...req.body,
            tenantName: tenant.name,
            propertyName: property.name
        };
        const payment = new Payment(paymentData);
        const savedPayment = await payment.save();

        // Update tenant balance and status if payment is completed
        if (savedPayment.status === 'completed') {
            // Get current month from payment date
            const paymentMonth = new Date(savedPayment.date).toISOString().slice(0, 7);
            const tenantMonth = tenant.currentMonth || new Date().toISOString().slice(0, 7);

            let currentBalance = tenant.balance || 0;

            // If payment is for a new month, reset balance to monthly rent
            if (paymentMonth !== tenantMonth) {
                currentBalance = tenant.monthlyRent;
            }

            // Deduct payment from balance
            const newBalance = currentBalance - savedPayment.amount;
            let newStatus = 'pending';
            if (newBalance <= 0) {
                newStatus = 'paid';
            } else if (newBalance < tenant.monthlyRent) {
                newStatus = 'partial';
            }

            await Tenant.findByIdAndUpdate(tenant._id, {
                balance: newBalance,
                currentMonth: paymentMonth,
                paymentStatus: newStatus
            });
        }

        res.status(201).json(savedPayment);
    } catch (error) {
        res.status(400).json({ message: 'Error creating payment', error });
    }
});

// Update payment - Admin/Manager only
router.put('/:id', auth, authorize(['admin', 'manager']), async (req: Request, res: Response) => {
    try {
        const existingPayment = await Payment.findById(req.params.id);
        if (!existingPayment) {
            return res.status(404).json({ message: 'Payment not found' });
        }

        const tenant = await Tenant.findById(existingPayment.tenantId);
        if (!tenant) {
            return res.status(404).json({ message: 'Tenant not found' });
        }

        const property = await Property.findOne({ _id: tenant.propertyId, user: (req as any).user.userId });
        if (!property) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const payment = await Payment.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        // Update tenant balance and status if payment is completed
        if (payment && payment.status === 'completed') {
            // Note: Ideally we should handle the case where we're updating an already completed payment
            // but for now we assume simple flow. We need to fetch the tenant again to get current balance.
            const currentTenant = await Tenant.findById(payment.tenantId);
            if (currentTenant) {
                // Get current month from payment date
                const paymentMonth = new Date(payment.date).toISOString().slice(0, 7);
                const tenantMonth = currentTenant.currentMonth || new Date().toISOString().slice(0, 7);

                let currentBalance = currentTenant.balance || 0;

                // If payment is for a new month, reset balance to monthly rent
                if (paymentMonth !== tenantMonth) {
                    currentBalance = currentTenant.monthlyRent;
                }

                // Deduct payment from balance
                const newBalance = currentBalance - payment.amount;
                let newStatus = 'pending';
                if (newBalance <= 0) {
                    newStatus = 'paid';
                } else if (newBalance < currentTenant.monthlyRent) {
                    newStatus = 'partial';
                }

                await Tenant.findByIdAndUpdate(payment.tenantId, {
                    balance: newBalance,
                    currentMonth: paymentMonth,
                    paymentStatus: newStatus
                });
            }
        }

        res.json(payment);
    } catch (error) {
        res.status(400).json({ message: 'Error updating payment', error });
    }
});

// Delete payment - Admin/Manager only
router.delete('/:id', auth, authorize(['admin', 'manager']), async (req: Request, res: Response) => {
    try {
        const payment = await Payment.findById(req.params.id);
        if (!payment) {
            return res.status(404).json({ message: 'Payment not found' });
        }

        const tenant = await Tenant.findById(payment.tenantId);
        if (!tenant) {
            return res.status(404).json({ message: 'Tenant not found' });
        }

        const property = await Property.findOne({ _id: tenant.propertyId, user: (req as any).user.userId });
        if (!property) {
            return res.status(403).json({ message: 'Access denied' });
        }

        await Payment.findByIdAndDelete(req.params.id);
        res.json({ message: 'Payment deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting payment', error });
    }
});

export default router;
