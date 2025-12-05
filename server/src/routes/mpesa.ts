import express from 'express';
import { mpesaDarajaService } from '../services/mpesa-daraja.service.js';
import { auth } from '../middleware/auth.js';
import Tenant from '../models/Tenant.js';
import RentHistory from '../models/RentHistory.js';

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

                // Extract payment details
                const metadata = stkCallback.CallbackMetadata.Item;
                const amountItem = metadata.find((item: any) => item.Name === 'Amount');
                const mpesaReceiptItem = metadata.find((item: any) => item.Name === 'MpesaReceiptNumber');
                const phoneItem = metadata.find((item: any) => item.Name === 'PhoneNumber');

                if (amountItem && mpesaReceiptItem && phoneItem) {
                    const amount = Number(amountItem.Value);
                    const transactionId = mpesaReceiptItem.Value;
                    const phoneNumber = String(phoneItem.Value);

                    console.log(`Processing payment: ${amount} from ${phoneNumber} (${transactionId})`);

                    // Find tenant by phone number
                    // Note: M-Pesa returns 254... format, ensure DB matches or normalize
                    const tenant = await Tenant.findOne({
                        phone: { $regex: new RegExp(phoneNumber.slice(-9)) } // Match last 9 digits to be safe
                    });

                    if (tenant) {
                        // Use actual calendar month for payment attribution (Adjust for EAT: UTC+3)
                        const now = new Date();
                        const eatDate = new Date(now.getTime() + (3 * 60 * 60 * 1000));
                        const currentMonth = eatDate.toISOString().slice(0, 7);

                        // Find or create rent history for the current month
                        let rentHistory = await RentHistory.findOne({
                            tenantId: tenant._id,
                            month: currentMonth
                        });

                        if (rentHistory) {
                            // Update existing record
                            rentHistory.amountPaid += amount;

                            // Update status (check against total including arrears)
                            if (rentHistory.amountPaid >= rentHistory.carriedForwardAmount) {
                                rentHistory.status = 'paid';
                            } else if (rentHistory.amountPaid > 0) {
                                rentHistory.status = 'partial';
                            }

                            await rentHistory.save();
                        } else {
                            // Should ideally exist if rent was generated, but handle edge case?
                            // For now, we assume rent history exists if they are paying
                            console.warn(`No rent history found for tenant ${tenant._id} for month ${currentMonth}`);
                        }

                        // Update tenant balance
                        tenant.balance -= amount;

                        // Update tenant payment status
                        if (tenant.balance <= 0) {
                            tenant.paymentStatus = 'paid';
                        } else {
                            tenant.paymentStatus = 'partial';
                        }

                        await tenant.save();
                        console.log(`Payment recorded for tenant ${tenant.name}`);
                    } else {
                        console.warn(`No tenant found with phone number ${phoneNumber}`);
                    }
                }
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

// Query transaction status (GET method with path parameter)
router.get('/query/:checkoutRequestId', auth, async (req, res) => {
    try {
        const { checkoutRequestId } = req.params;

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
