import React, { useState } from 'react';
import { Search, Loader2, CheckCircle, XCircle, AlertCircle, FileText } from 'lucide-react';
import { mpesaAPI } from '../services/api';

const TransactionVerification = () => {
    const [transactionId, setTransactionId] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState('');

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!transactionId.trim()) return;

        setLoading(true);
        setError('');
        setResult(null);

        try {
            const response = await mpesaAPI.checkStatus(transactionId);
            // Backend wraps the M-Pesa response in a 'data' property
            setResult(response.data || response);
        } catch (err: any) {
            setError(err.message || 'Failed to verify transaction');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (code: string) => {
        if (code === '0') return 'text-green-600 bg-green-50';
        return 'text-red-600 bg-red-50';
    };

    const getStatusIcon = (code: string) => {
        if (code === '0') return <CheckCircle className="w-6 h-6" />;
        return <XCircle className="w-6 h-6" />;
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Transaction Verification</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Verify M-PESA transaction status</p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
                <form onSubmit={handleVerify} className="flex gap-4 max-w-2xl">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            value={transactionId}
                            onChange={(e) => setTransactionId(e.target.value)}
                            placeholder="Enter M-PESA Receipt Number (e.g., NEF61H8J60)"
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading || !transactionId.trim()}
                        className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify Status'}
                    </button>
                </form>

                {error && (
                    <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg flex items-center gap-3">
                        <AlertCircle className="w-5 h-5" />
                        {error}
                    </div>
                )}

                {result && (
                    <div className="mt-8 border-t border-gray-200 dark:border-slate-700 pt-6">
                        <div className={`flex items-center gap-3 p-4 rounded-lg mb-6 ${getStatusColor(result.ResponseCode)}`}>
                            {getStatusIcon(result.ResponseCode)}
                            <div>
                                <p className="font-semibold">{result.ResponseDescription}</p>
                                <p className="text-sm opacity-90">Code: {result.ResponseCode}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-gray-50 dark:bg-slate-700/50 p-4 rounded-lg">
                                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4 flex items-center gap-2">
                                    <FileText className="w-4 h-4" />
                                    Transaction Details
                                </h3>
                                <dl className="space-y-3">
                                    <div className="flex justify-between">
                                        <dt className="text-sm text-gray-600 dark:text-gray-400">Conversation ID</dt>
                                        <dd className="text-sm font-medium dark:text-gray-200">{result.ConversationID}</dd>
                                    </div>
                                    <div className="flex justify-between">
                                        <dt className="text-sm text-gray-600 dark:text-gray-400">Originator ID</dt>
                                        <dd className="text-sm font-medium dark:text-gray-200">{result.OriginatorConversationID}</dd>
                                    </div>
                                </dl>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TransactionVerification;
