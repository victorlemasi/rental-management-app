import express, { Request, Response } from 'express';
import MaintenanceRequest from '../models/MaintenanceRequest.js';

const router = express.Router();

// Get all maintenance requests
router.get('/', async (req: Request, res: Response) => {
    try {
        const requests = await MaintenanceRequest.find().populate('propertyId').sort({ createdAt: -1 });
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching maintenance requests', error });
    }
});

// Get single maintenance request
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const request = await MaintenanceRequest.findById(req.params.id).populate('propertyId');
        if (!request) {
            return res.status(404).json({ message: 'Maintenance request not found' });
        }
        res.json(request);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching maintenance request', error });
    }
});

// Create maintenance request
router.post('/', async (req: Request, res: Response) => {
    try {
        const request = new MaintenanceRequest(req.body);
        const savedRequest = await request.save();
        res.status(201).json(savedRequest);
    } catch (error) {
        res.status(400).json({ message: 'Error creating maintenance request', error });
    }
});

// Update maintenance request
router.put('/:id', async (req: Request, res: Response) => {
    try {
        const request = await MaintenanceRequest.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!request) {
            return res.status(404).json({ message: 'Maintenance request not found' });
        }
        res.json(request);
    } catch (error) {
        res.status(400).json({ message: 'Error updating maintenance request', error });
    }
});

// Delete maintenance request
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const request = await MaintenanceRequest.findByIdAndDelete(req.params.id);
        if (!request) {
            return res.status(404).json({ message: 'Maintenance request not found' });
        }
        res.json({ message: 'Maintenance request deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting maintenance request', error });
    }
});

export default router;
