import express from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { auth } from '../middleware/auth';

const router = express.Router();

// Get user profile
router.get('/profile', auth, async (req, res) => {
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
            role: user.role,
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
router.put('/profile', auth, async (req, res) => {
    try {
        const { name, email, phone } = req.body;
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

        await user.save();

        // Return updated user without password
        const updatedUser = {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
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
router.post('/change-password', auth, async (req, res) => {
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
router.get('/notification-settings', auth, async (req, res) => {
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
router.put('/notification-settings', auth, async (req, res) => {
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
