import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const MPESA_AUTH_URL = 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';
const MPESA_TRANSACTION_STATUS_URL = 'https://sandbox.safaricom.co.ke/mpesa/transactionstatus/v1/query';

// Token cache
let cachedToken: string | null = null;
let tokenExpiry: number = 0;

export const mpesaService = {
    getAccessToken: async () => {
        // Return cached token if still valid (with 5 min buffer)
        if (cachedToken && Date.now() < tokenExpiry - 300000) {
            console.log('Using cached M-PESA token');
            return cachedToken;
        }

        const consumerKey = process.env.MPESA_CONSUMER_KEY;
        const consumerSecret = process.env.MPESA_CONSUMER_SECRET;

        if (!consumerKey || !consumerSecret) {
            throw new Error('M-PESA Consumer Key or Secret is missing');
        }

        const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

        try {
            console.log('Requesting new M-PESA access token...');
            const response = await axios.get(MPESA_AUTH_URL, {
                headers: {
                    Authorization: `Basic ${auth}`,
                },
            });

            cachedToken = response.data.access_token;
            // Tokens are valid for 3600 seconds (1 hour)
            tokenExpiry = Date.now() + (3600 * 1000);

            console.log('✅ M-PESA access token obtained successfully');
            return cachedToken;
        } catch (error: any) {
            console.error('❌ M-PESA Auth Error:');
            console.error('Status:', error.response?.status);
            console.error('Data:', JSON.stringify(error.response?.data, null, 2));

            const errorMsg = error.response?.data?.error_description ||
                error.response?.data?.errorMessage ||
                'Failed to get M-PESA access token';
            throw new Error(errorMsg);
        }
    },

    checkTransactionStatus: async (transactionId: string) => {
        try {
            console.log(`\n🔍 Checking transaction status for: ${transactionId}`);
            const token = await mpesaService.getAccessToken();

            // In a real app, these would be dynamic or strictly configured
            const initiator = process.env.MPESA_INITIATOR_NAME || 'testapiuser';
            const securityCredential = process.env.MPESA_SECURITY_CREDENTIAL;
            const partyA = process.env.MPESA_PARTY_A || '600782';
            const identifierType = '4';
            const resultUrl = process.env.MPESA_RESULT_URL || 'https://mydomain.com/mpesa/result';
            const queueTimeoutUrl = process.env.MPESA_TIMEOUT_URL || 'https://mydomain.com/mpesa/timeout';

            if (!securityCredential) {
                throw new Error('M-PESA Security Credential is missing');
            }

            const payload = {
                "Initiator": initiator,
                "SecurityCredential": securityCredential,
                "CommandID": "TransactionStatusQuery",
                "TransactionID": transactionId,
                "PartyA": partyA,
                "IdentifierType": identifierType,
                "ResultURL": resultUrl,
                "QueueTimeOutURL": queueTimeoutUrl,
                "Remarks": "Transaction Status Query",
                "Occasion": "Verify"
            };

            console.log('📤 Sending request to Safaricom...');
            const response = await axios.post(MPESA_TRANSACTION_STATUS_URL, payload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            console.log('✅ Transaction status query successful');
            return response.data;
        } catch (error: any) {
            console.error('\n❌ M-PESA Transaction Status Error:');
            console.error('Status code:', error.response?.status);
            console.error('Error data:', JSON.stringify(error.response?.data, null, 2));

            // If token is invalid, clear cache and retry once
            if (error.response?.data?.errorCode === '404.001.03') {
                console.log('🔄 Token invalid, clearing cache...');
                cachedToken = null;
                tokenExpiry = 0;
            }

            // Extract specific error message from Safaricom response
            const errorData = error.response?.data;
            const errorMessage = errorData?.errorMessage ||
                errorData?.errorCode ||
                error.message ||
                'Failed to query transaction status';

            throw new Error(`Safaricom API Error: ${JSON.stringify(errorData || errorMessage)}`);
        }
    }
};
