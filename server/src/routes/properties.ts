import express, { Request, Response } from 'express';
import Property from '../models/Property.js';
import { auth, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get all properties - Protected but accessible by all roles
router.get('/', auth, async (req: Request, res: Response) => {
    try {
        const properties = await Property.find({ user: (req as any).user.userId }).sort({ createdAt: -1 });
        res.json(properties);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching properties', error });
    }
});

// Get single property - Protected but accessible by all roles
router.get('/:id', auth, async (req: Request, res: Response) => {
    try {
        const property = await Property.findOne({ _id: req.params.id, user: (req as any).user.userId });
        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }
        res.json(property);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching property', error });
    }
});

// Create property - Admin/Manager only
router.post('/', auth, authorize(['admin', 'manager']), async (req: Request, res: Response) => {
    try {
        const property = new Property({
            ...req.body,
            user: (req as any).user.userId
        });
        const savedProperty = await property.save();
        res.status(201).json(savedProperty);
    } catch (error) {
        res.status(400).json({ message: 'Error creating property', error });
    }
});

// Update property - Admin/Manager only
router.put('/:id', auth, authorize(['admin', 'manager']), async (req: Request, res: Response) => {
    try {
        const property = await Property.findOneAndUpdate(
            { _id: req.params.id, user: (req as any).user.userId },
            req.body,
            { new: true, runValidators: true }
        );
        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }
        res.json(property);
    } catch (error) {
        res.status(400).json({ message: 'Error updating property', error });
    }
});

// Delete property - Admin/Manager only
router.delete('/:id', auth, authorize(['admin', 'manager']), async (req: Request, res: Response) => {
    try {
        const property = await Property.findOneAndDelete({ _id: req.params.id, user: (req as any).user.userId });
        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }
        res.json({ message: 'Property deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting property', error });
    }
});

export default router;
