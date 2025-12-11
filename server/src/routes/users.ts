import express, { Response } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import Tenant from '../models/Tenant.js';
import { auth } from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

import { fileURLToPath } from 'url';

// Define AuthRequest interface to match the one in auth middleware
interface AuthRequest extends express.Request {
    user?: any;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure Multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Use absolute path based on this file's location to ensure consistency with static serve
        // users.ts is in src/routes, so we go up two levels to src, then to server root, then to uploads
        const uploadDir = path.join(__dirname, '../../uploads/profiles');
        console.log('Uploading to directory:', uploadDir);

        // Ensure directory exists
        if (!fs.existsSync(uploadDir)) {
            console.log('Creating directory...');
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Create unique filename: user-id-timestamp.ext
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const filename = 'user-' + uniqueSuffix + path.extname(file.originalname);
        console.log('Generated filename:', filename);
        cb(null, filename);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        console.log('Processing file:', file.originalname, file.mimetype);
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            console.error('File rejected: Not an image');
            cb(new Error('Only images are allowed'));
        }
    }
});

// Get user profile
router.get('/profile', auth, async (req: AuthRequest, res: Response) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone || '',
            profilePicture: user.profilePicture || '',
            role: user.role,
            createdAt: user.createdAt,
            lastLogin: user.lastLogin,
            status: user.status || 'active',
            isVerified: user.isVerified || false,
            notificationSettings: user.notificationSettings || {
                email: true,
                push: true,
                sms: false,
                monthlyReport: true
            }
        });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update user profile
router.put('/profile', auth, upload.single('profilePicture'), async (req: AuthRequest, res: Response) => {
    try {
        const { name, email, phone } = req.body;
        // Check if a file was uploaded? req.file is available due to multer
        const profilePictureParams = req.body.profilePicture; // If sent as string (existing logic)

        // We'll prioritize the file if it exists
        const file = (req as any).file;
        let finalProfilePicture = profilePictureParams;

        if (file) {
            // Construct the URL. Assuming the server serves /uploads statically.
            // We'll store the relative path. The frontend can prepend the base URL.
            finalProfilePicture = `/uploads/profiles/${file.filename}`;
        }
        const user = await User.findById(req.user.userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if email is being changed and if it's already taken
        if (email && email !== user.email) {
            const emailExists = await User.findOne({ email });
            if (emailExists) {
                return res.status(400).json({ message: 'Email already in use' });
            }
            user.email = email;
        }

        if (name) user.name = name;
        if (phone !== undefined) user.phone = phone;
        if (finalProfilePicture !== undefined) user.profilePicture = finalProfilePicture;

        await user.save();

        // If user is a tenant, sync profile picture to Tenant model
        if (user.role === 'tenant') {
            await Tenant.findOneAndUpdate(
                { email: user.email },
                { profilePicture: user.profilePicture }
            );
        }

        // Return updated user without password
        const updatedUser = {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            profilePicture: user.profilePicture,
            role: user.role
        };

        res.json({
            message: 'Profile updated successfully',
            user: updatedUser
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Change password
router.post('/change-password', auth, async (req: AuthRequest, res: Response) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Current password and new password are required' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'New password must be at least 6 characters long' });
        }

        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);

        await user.save();

        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get notification settings
router.get('/notification-settings', auth, async (req: AuthRequest, res: Response) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const settings = user.notificationSettings || {
            email: true,
            push: true,
            sms: false,
            monthlyReport: true
        };

        res.json(settings);
    } catch (error) {
        console.error('Error fetching notification settings:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update notification settings
router.put('/notification-settings', auth, async (req: AuthRequest, res: Response) => {
    try {
        const { email, push, sms, monthlyReport } = req.body;
        const user = await User.findById(req.user.userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.notificationSettings = {
            email: email !== undefined ? email : user.notificationSettings?.email ?? true,
            push: push !== undefined ? push : user.notificationSettings?.push ?? true,
            sms: sms !== undefined ? sms : user.notificationSettings?.sms ?? false,
            monthlyReport: monthlyReport !== undefined ? monthlyReport : user.notificationSettings?.monthlyReport ?? true
        };

        await user.save();

        res.json({
            message: 'Notification settings updated successfully',
            settings: user.notificationSettings
        });
    } catch (error) {
        console.error('Error updating notification settings:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
