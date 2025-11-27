import express, { Request, Response } from 'express';

const router = express.Router();

// Mock send notification
router.post('/send', async (req: Request, res: Response) => {
    try {
        const { recipients, subject, message, type } = req.body;

        // In a real app, this would integrate with SendGrid/AWS SES
        console.log('----------------------------------------');
        console.log('📧 MOCK EMAIL SERVICE - SENDING NOTIFICATION');
        console.log('----------------------------------------');
        console.log(`To: ${recipients.length} recipients`);
        console.log(`Subject: ${subject}`);
        console.log(`Message: ${message}`);
        console.log('----------------------------------------');

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        res.json({
            success: true,
            message: `Successfully sent ${type} notification to ${recipients.length} recipients`
        });
    } catch (error) {
        console.error('Notification error:', error);
        res.status(500).json({ message: 'Failed to send notifications' });
    }
});

export default router;
