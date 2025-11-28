import axios from 'axios';

interface MpesaConfig {
    consumerKey: string;
    consumerSecret: string;
    shortcode: string;
    passkey: string;
    callbackUrl: string;
    environment: 'sandbox' | 'production';
}

class MpesaDarajaService {
    private config: MpesaConfig;
    private baseUrl: string;

    constructor() {
        this.config = {
            consumerKey: process.env.MPESA_CONSUMER_KEY || '',
            consumerSecret: process.env.MPESA_CONSUMER_SECRET || '',
            shortcode: process.env.MPESA_SHORTCODE || '',
            passkey: process.env.MPESA_PASSKEY || '',
            callbackUrl: process.env.MPESA_CALLBACK_URL || '',
            environment: (process.env.MPESA_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox'
        };

        this.baseUrl = this.config.environment === 'sandbox'
            ? 'https://sandbox.safaricom.co.ke'
            : 'https://api.safaricom.co.ke';
    }

    /**
     * Generate OAuth access token
     */
    async getAccessToken(): Promise<string> {
        const auth = Buffer.from(`${this.config.consumerKey}:${this.config.consumerSecret}`).toString('base64');

        try {
            const response = await axios.get(`${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
                headers: {
                    Authorization: `Basic ${auth}`
                }
            });

            return response.data.access_token;
        } catch (error: any) {
            console.error('OAuth error:', error.response?.data || error.message);
            throw new Error('Failed to get M-Pesa access token');
        }
    }

    /**
     * Generate password for STK Push
     */
    private generatePassword(): { password: string; timestamp: string } {
        const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
        const password = Buffer.from(`${this.config.shortcode}${this.config.passkey}${timestamp}`).toString('base64');

        return { password, timestamp };
    }

    /**
     * Initiate STK Push (Lipa Na M-Pesa Online)
     */
    async stkPush(phoneNumber: string, amount: number, accountReference: string, transactionDesc: string) {
        const accessToken = await this.getAccessToken();
        const { password, timestamp } = this.generatePassword();

        // Format phone number (remove + and ensure it starts with 254)
        const formattedPhone = phoneNumber.replace(/^\+/, '').replace(/^0/, '254');

        const payload = {
            BusinessShortCode: this.config.shortcode,
            Password: password,
            Timestamp: timestamp,
            TransactionType: 'CustomerPayBillOnline',
            Amount: Math.ceil(amount), // M-Pesa requires integer
            PartyA: formattedPhone,
            PartyB: this.config.shortcode,
            PhoneNumber: formattedPhone,
            CallBackURL: this.config.callbackUrl,
            AccountReference: accountReference,
            TransactionDesc: transactionDesc
        };

        try {
            const response = await axios.post(
                `${this.baseUrl}/mpesa/stkpush/v1/processrequest`,
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return response.data;
        } catch (error: any) {
            console.error('STK Push error:', error.response?.data || error.message);
            throw new Error(error.response?.data?.errorMessage || 'Failed to initiate M-Pesa payment');
        }
    }

    /**
     * Query transaction status
     */
    async queryTransaction(checkoutRequestId: string) {
        const accessToken = await this.getAccessToken();
        const { password, timestamp } = this.generatePassword();

        const payload = {
            BusinessShortCode: this.config.shortcode,
            Password: password,
            Timestamp: timestamp,
            CheckoutRequestID: checkoutRequestId
        };

        try {
            const response = await axios.post(
                `${this.baseUrl}/mpesa/stkpushquery/v1/query`,
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return response.data;
        } catch (error: any) {
            console.error('Query error:', error.response?.data || error.message);
            throw new Error('Failed to query transaction status');
        }
    }

    /**
     * Validate configuration
     */
    isConfigured(): boolean {
        return !!(
            this.config.consumerKey &&
            this.config.consumerSecret &&
            this.config.shortcode &&
            this.config.passkey &&
            this.config.callbackUrl
        );
    }
}

export const mpesaDarajaService = new MpesaDarajaService();
