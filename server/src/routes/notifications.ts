import express, { Request, Response } from 'express';
import Notification from '../models/Notification.js';
import Tenant from '../models/Tenant.js';
import Property from '../models/Property.js';
import { auth, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get notifications for current tenant
router.get('/my-notifications', auth, authorize(['tenant']), async (req: any, res: Response) => {
    try {
        const { User } = await import('../models/User.js');
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const tenant = await Tenant.findOne({ email: user.email });
        if (!tenant) {
            return res.status(404).json({ message: 'Tenant profile not found' });
        }

        // Get notifications for this tenant (all notifications or specific to this tenant)
        const notifications = await Notification.find({
            $or: [
                { recipientType: 'all' },
                { recipientIds: tenant._id }
            ]
        }).sort({ createdAt: -1 });

        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching notifications', error });
    }
});

// Create notification - Admin/Manager only
router.post('/', auth, authorize(['admin', 'manager']), async (req: Request, res: Response) => {
    try {
        const { title, message, type, recipientType, recipientIds } = req.body;

        // Verify property ownership if sending to specific tenants
        if (recipientType === 'specific' && recipientIds && recipientIds.length > 0) {
            const properties = await Property.find({ user: (req as any).user.userId });
            const propertyIds = properties.map(p => p._id);

            const tenants = await Tenant.find({
                _id: { $in: recipientIds },
                propertyId: { $in: propertyIds }
            });

            if (tenants.length !== recipientIds.length) {
                return res.status(403).json({ message: 'Access denied to some recipients' });
            }
        }

        const notification = new Notification({
            title,
            message,
            type,
            recipientType,
            recipientIds: recipientType === 'specific' ? recipientIds : [],
            senderId: (req as any).user.userId,
            senderName: (req as any).user.name || 'Admin'
        });

        const savedNotification = await notification.save();
        res.status(201).json(savedNotification);
    } catch (error) {
        res.status(400).json({ message: 'Error creating notification', error });
    }
});

// Get all notifications sent by admin
router.get('/', auth, authorize(['admin', 'manager']), async (req: Request, res: Response) => {
    try {
        const notifications = await Notification.find({ senderId: (req as any).user.userId })
            .sort({ createdAt: -1 });
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching notifications', error });
    }
});

// Mark notification as read
router.put('/:id/read', auth, async (req: Request, res: Response) => {
    try {
        const notification = await Notification.findByIdAndUpdate(
            req.params.id,
            { read: true },
            { new: true }
        );
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }
        res.json(notification);
    } catch (error) {
        res.status(400).json({ message: 'Error updating notification', error });
    }
});

// Delete notification - Admin/Manager only
router.delete('/:id', auth, authorize(['admin', 'manager']), async (req: Request, res: Response) => {
    try {
        const notification = await Notification.findOneAndDelete({
            _id: req.params.id,
            senderId: (req as any).user.userId
        });
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }
        res.json({ message: 'Notification deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting notification', error });
    }
});

export default router;
