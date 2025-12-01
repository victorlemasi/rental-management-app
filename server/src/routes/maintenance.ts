import express, { Request, Response } from 'express';
import MaintenanceRequest from '../models/MaintenanceRequest.js';
import { User } from '../models/User.js';
import Tenant from '../models/Tenant.js';
import Property from '../models/Property.js';
import { auth, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get my maintenance requests - Tenant only
router.get('/my-requests', auth, authorize(['tenant']), async (req: any, res: Response) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const tenant = await Tenant.findOne({ email: user.email });
        if (!tenant) {
            return res.status(404).json({ message: 'Tenant profile not found' });
        }

        // Note: We need to ensure MaintenanceRequest has tenantId or we filter by tenantName/email
        // Since tenantId was removed, we might need to rely on tenantName or re-add tenantId.
        // For now, let's assume we filter by tenantName which is in the model.
        const requests = await MaintenanceRequest.find({ tenantName: tenant.name })
            .populate('propertyId')
            .sort({ createdAt: -1 });

        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching maintenance requests', error });
    }
});

// Get all maintenance requests - Admin/Manager only
router.get('/', auth, authorize(['admin', 'manager']), async (req: Request, res: Response) => {
    try {
        // Find properties owned by the user
        const properties = await Property.find({ user: (req as any).user.userId });
        const propertyIds = properties.map(p => p._id);

        const requests = await MaintenanceRequest.find({ propertyId: { $in: propertyIds } })
            .populate('propertyId')
            .sort({ createdAt: -1 });
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching maintenance requests', error });
    }
});

// Get single maintenance request - Admin/Manager only (Tenant uses /my-requests)
router.get('/:id', auth, authorize(['admin', 'manager']), async (req: Request, res: Response) => {
    try {
        const request = await MaintenanceRequest.findById(req.params.id).populate('propertyId');
        if (!request) {
            return res.status(404).json({ message: 'Maintenance request not found' });
        }

        // Check ownership
        const property = await Property.findOne({ _id: request.propertyId, user: (req as any).user.userId });
        if (!property) {
            return res.status(403).json({ message: 'Access denied' });
        }

        res.json(request);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching maintenance request', error });
    }
});

// Create maintenance request - Accessible by all (Tenants create their own)
router.post('/', auth, authorize(['admin', 'manager', 'tenant']), async (req: Request, res: Response) => {
    try {
        const request = new MaintenanceRequest(req.body);
        const savedRequest = await request.save();
        res.status(201).json(savedRequest);
    } catch (error) {
        res.status(400).json({ message: 'Error creating maintenance request', error });
    }
});

// Update maintenance request - Admin/Manager only
router.put('/:id', auth, authorize(['admin', 'manager']), async (req: Request, res: Response) => {
    try {
        const existingRequest = await MaintenanceRequest.findById(req.params.id);
        if (!existingRequest) {
            return res.status(404).json({ message: 'Maintenance request not found' });
        }

        // Check ownership
        const property = await Property.findOne({ _id: existingRequest.propertyId, user: (req as any).user.userId });
        if (!property) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const request = await MaintenanceRequest.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        res.json(request);
    } catch (error) {
        res.status(400).json({ message: 'Error updating maintenance request', error });
    }
});

// Delete maintenance request - Admin/Manager only
router.delete('/:id', auth, authorize(['admin', 'manager']), async (req: Request, res: Response) => {
    try {
        const request = await MaintenanceRequest.findById(req.params.id);
        if (!request) {
            return res.status(404).json({ message: 'Maintenance request not found' });
        }

        // Check ownership
        const property = await Property.findOne({ _id: request.propertyId, user: (req as any).user.userId });
        if (!property) {
            return res.status(403).json({ message: 'Access denied' });
        }

        await MaintenanceRequest.findByIdAndDelete(req.params.id);
        res.json({ message: 'Maintenance request deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting maintenance request', error });
    }
});

export default router;
