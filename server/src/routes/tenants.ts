import express, { Request, Response } from 'express';
import Tenant from '../models/Tenant.js';

const router = express.Router();

// Get all tenants
router.get('/', async (req: Request, res: Response) => {
    try {
        const tenants = await Tenant.find().populate('propertyId').sort({ createdAt: -1 });
        res.json(tenants);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching tenants', error });
    }
});

// Get single tenant
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const tenant = await Tenant.findById(req.params.id).populate('propertyId');
        if (!tenant) {
            return res.status(404).json({ message: 'Tenant not found' });
        }
        res.json(tenant);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching tenant', error });
    }
});

// Create tenant
router.post('/', async (req: Request, res: Response) => {
    try {
        const tenant = new Tenant(req.body);
        const savedTenant = await tenant.save();
        res.status(201).json(savedTenant);
    } catch (error) {
        res.status(400).json({ message: 'Error creating tenant', error });
    }
});

// Update tenant
router.put('/:id', async (req: Request, res: Response) => {
    try {
        const tenant = await Tenant.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!tenant) {
            return res.status(404).json({ message: 'Tenant not found' });
        }
        res.json(tenant);
    } catch (error) {
        res.status(400).json({ message: 'Error updating tenant', error });
    }
});

// Delete tenant
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const tenant = await Tenant.findByIdAndDelete(req.params.id);
        if (!tenant) {
            return res.status(404).json({ message: 'Tenant not found' });
        }
        res.json({ message: 'Tenant deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting tenant', error });
    }
});

export default router;
