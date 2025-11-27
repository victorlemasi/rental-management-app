import express, { Request, Response } from 'express';
import Payment from '../models/Payment.js';

const router = express.Router();

// Get all payments
router.get('/', async (req: Request, res: Response) => {
    try {
        const payments = await Payment.find().populate('tenantId').sort({ date: -1 });
        res.json(payments);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching payments', error });
    }
});

// Get single payment
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const payment = await Payment.findById(req.params.id).populate('tenantId');
        if (!payment) {
            return res.status(404).json({ message: 'Payment not found' });
        }
        res.json(payment);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching payment', error });
    }
});

// Create payment
router.post('/', async (req: Request, res: Response) => {
    try {
        const payment = new Payment(req.body);
        const savedPayment = await payment.save();
        res.status(201).json(savedPayment);
    } catch (error) {
        res.status(400).json({ message: 'Error creating payment', error });
    }
});

// Update payment
router.put('/:id', async (req: Request, res: Response) => {
    try {
        const payment = await Payment.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!payment) {
            return res.status(404).json({ message: 'Payment not found' });
        }
        res.json(payment);
    } catch (error) {
        res.status(400).json({ message: 'Error updating payment', error });
    }
});

// Delete payment
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const payment = await Payment.findByIdAndDelete(req.params.id);
        if (!payment) {
            return res.status(404).json({ message: 'Payment not found' });
        }
        res.json({ message: 'Payment deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting payment', error });
    }
});

export default router;
