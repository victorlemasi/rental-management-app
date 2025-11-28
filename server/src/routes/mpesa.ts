import express from 'express';
import { auth } from '../middleware/auth.js';
import { mpesaDarajaService } from '../services/mpesa-daraja.service.js';

const router = express.Router();

// Initiate STK Push
router.post('/stk-push', auth, async (req, res) => {
    try {
        const { phoneNumber, amount, email } = req.body;

        console.log('STK Push request:', { phoneNumber, amount, email });

        if (!phoneNumber || !amount) {
            return res.status(400).json({ message: 'Phone number and amount are required' });
        }

        // Check if M-Pesa is configured
        if (!mpesaDarajaService.isConfigured()) {
            console.error('M-Pesa Daraja API not configured');
            return res.status(500).json({
                message: 'Payment service not configured. Please contact support.',
                success: false
            });
        }

        // Initiate STK Push
        const accountReference = `RENT-${Date.now()}`;
        const transactionDesc = 'Rent Payment';

        const response = await mpesaDarajaService.stkPush(
            phoneNumber,
            amount,
            accountReference,
            transactionDesc
        );

        console.log('Daraja STK Push response:', response);

        res.json({
            success: true,
            message: 'STK Push sent successfully. Please check your phone.',
            data: {
                checkoutRequestId: response.CheckoutRequestID,
                merchantRequestId: response.MerchantRequestID,
                responseCode: response.ResponseCode,
                responseDescription: response.ResponseDescription
            }
        });
    } catch (error: any) {
        console.error('STK Push error:', error);
        res.status(500).json({
            message: error.message || 'Error initiating STK Push',
            success: false
        });
    }
});

// M-Pesa Callback endpoint
router.post('/callback', async (req, res) => {
    try {
        console.log('M-Pesa Callback received:', JSON.stringify(req.body, null, 2));

        const { Body } = req.body;
        const { stkCallback } = Body || {};

        if (stkCallback) {
            const { ResultCode, ResultDesc, CheckoutRequestID, CallbackMetadata } = stkCallback;

            console.log('Transaction Result:', {
                ResultCode,
                ResultDesc,
                CheckoutRequestID
            });

            if (ResultCode === 0) {
                // Payment successful
                console.log('Payment successful!');
                console.log('Callback metadata:', CallbackMetadata);

                // TODO: Update payment record in database
                // Extract amount, phone number, transaction ID from CallbackMetadata
            } else {
                // Payment failed or cancelled
                console.log('Payment failed:', ResultDesc);
            }
        }

        // Always respond with success to M-Pesa
        res.json({ ResultCode: 0, ResultDesc: 'Success' });
    } catch (error: any) {
        console.error('Callback error:', error);
        res.json({ ResultCode: 0, ResultDesc: 'Success' });
    }
});

// Query transaction status
router.post('/query', auth, async (req, res) => {
    try {
        const { checkoutRequestId } = req.body;

        if (!checkoutRequestId) {
            return res.status(400).json({ message: 'Checkout Request ID is required' });
        }

        const response = await mpesaDarajaService.queryTransaction(checkoutRequestId);

        res.json({
            success: true,
            data: response
        });
    } catch (error: any) {
        console.error('Query error:', error);
        res.status(500).json({
            message: error.message || 'Error querying transaction',
            success: false
        });
    }
});

export const mpesaRoutes = router;
