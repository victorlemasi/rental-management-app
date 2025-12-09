import React, { useState } from 'react';
import { CreditCard, Building2, Smartphone } from 'lucide-react';
import { mpesaAPI } from '../../services/api';
import type { Tenant } from '../../types';

interface PaymentProps {
    tenant: Tenant | null;
}

const Payment: React.FC<PaymentProps> = ({ tenant }) => {
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [paymentLoading, setPaymentLoading] = useState(false);

    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!tenant) return;

        setPaymentLoading(true);
        try {
            // Format phone number (remove leading 0 or +254, ensure it starts with 254)
            let formattedPhone = phoneNumber.replace(/\D/g, '');
            if (formattedPhone.startsWith('0')) {
                formattedPhone = '254' + formattedPhone.substring(1);
            } else if (!formattedPhone.startsWith('254')) {
                formattedPhone = '254' + formattedPhone;
            }

            await mpesaAPI.stkPush({
                phoneNumber: formattedPhone,
                amount: tenant.monthlyRent,
                accountReference: tenant.unitNumber
            });

            alert('Payment initiated! Please check your phone to complete the transaction.');
            setShowPaymentModal(false);
            setPhoneNumber('');
        } catch (error: any) {
            console.error('Payment error:', error);
            alert(error.message || 'Failed to initiate payment');
        } finally {
            setPaymentLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Payment Options */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* M-Pesa Payment */}
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-sm border-2 border-green-300 overflow-hidden">
                    <div className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-green-600 p-3 rounded-lg">
                                <Smartphone className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">M-Pesa Payment</h2>
                                <p className="text-sm text-gray-600">Pay instantly with M-Pesa</p>
                            </div>
                        </div>
                        <div className="bg-white rounded-lg p-4 mb-4">
                            <p className="text-sm text-gray-600 mb-2">Amount to Pay</p>
                            <p className="text-4xl font-bold text-green-600">
                                KSh {tenant?.monthlyRent.toLocaleString() || 0}
                            </p>
                        </div>
                        <button
                            onClick={() => setShowPaymentModal(true)}
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-lg transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                            Pay with M-Pesa
                        </button>
                        <div className="mt-4 bg-green-200 rounded-lg p-3">
                            <p className="text-xs text-green-800 font-medium">
                                ✓ Instant payment confirmation<br />
                                ✓ Secure and encrypted transaction<br />
                                ✓ No hidden fees
                            </p>
                        </div>
                    </div>
                </div>

                {/* Bank Transfer */}
                {tenant?.propertyId && typeof tenant.propertyId === 'object' &&
                    (tenant.propertyId.paymentAccountNumber || tenant.propertyId.paymentAccountName) && (
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-sm border-2 border-blue-300 overflow-hidden">
                            <div className="p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="bg-blue-600 p-3 rounded-lg">
                                        <Building2 className="w-8 h-8 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900">Bank Transfer</h2>
                                        <p className="text-sm text-gray-600">Pay via bank or mobile money</p>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    {tenant.propertyId.paymentAccountName && (
                                        <div className="bg-white rounded-lg p-4">
                                            <p className="text-xs text-blue-700 font-semibold mb-1">ACCOUNT NAME</p>
                                            <p className="text-lg font-bold text-gray-900">
                                                {tenant.propertyId.paymentAccountName}
                                            </p>
                                        </div>
                                    )}
                                    {tenant.propertyId.paymentAccountNumber && (
                                        <div className="bg-white rounded-lg p-4">
                                            <p className="text-xs text-blue-700 font-semibold mb-1">ACCOUNT NUMBER</p>
                                            <p className="text-2xl font-bold text-blue-900 tracking-wider">
                                                {tenant.propertyId.paymentAccountNumber}
                                            </p>
                                        </div>
                                    )}
                                    <div className="bg-white rounded-lg p-4">
                                        <p className="text-xs text-blue-700 font-semibold mb-1">REFERENCE</p>
                                        <p className="text-lg font-bold text-gray-900">
                                            Unit {tenant.unitNumber}
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-4 bg-blue-200 rounded-lg p-3">
                                    <p className="text-xs text-blue-800 font-medium">
                                        💡 Always include your unit number as reference<br />
                                        💡 Payment may take 24-48 hours to reflect<br />
                                        💡 Keep your transaction receipt
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
            </div>

            {/* Payment Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <CreditCard className="w-6 h-6 text-primary-600" />
                        Payment Information
                    </h2>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4">
                            <p className="text-sm text-gray-600 mb-1">Monthly Rent</p>
                            <p className="text-2xl font-bold text-gray-900">
                                KSh {tenant?.monthlyRent.toLocaleString() || 0}
                            </p>
                        </div>
                        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4">
                            <p className="text-sm text-gray-600 mb-1">Current Balance</p>
                            <p className={`text-2xl font-bold ${(tenant?.balance || 0) > 0 ? 'text-orange-600' : 'text-green-600'
                                }`}>
                                KSh {Math.max(0, tenant?.balance || 0).toLocaleString()}
                            </p>
                        </div>
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
                            <p className="text-sm text-gray-600 mb-1">Payment Status</p>
                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${tenant?.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                                tenant?.paymentStatus === 'partial' ? 'bg-orange-100 text-orange-800' :
                                    tenant?.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-red-100 text-red-800'
                                }`}>
                                {tenant?.paymentStatus?.toUpperCase() || 'PENDING'}
                            </span>
                        </div>
                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
                            <p className="text-sm text-gray-600 mb-1">Unit Number</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {tenant?.unitNumber || 'N/A'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Payment Instructions */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Payment Guidelines</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <div className="flex items-start gap-3">
                            <div className="bg-primary-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-sm font-bold">1</span>
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900">Choose Payment Method</p>
                                <p className="text-sm text-gray-600">Select either M-Pesa for instant payment or bank transfer</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="bg-primary-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-sm font-bold">2</span>
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900">Complete Payment</p>
                                <p className="text-sm text-gray-600">Follow the instructions for your chosen payment method</p>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-start gap-3">
                            <div className="bg-primary-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-sm font-bold">3</span>
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900">Payment Confirmation</p>
                                <p className="text-sm text-gray-600">M-Pesa payments are instant, bank transfers take 24-48 hours</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="bg-primary-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-sm font-bold">4</span>
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900">Keep Records</p>
                                <p className="text-sm text-gray-600">Save your payment confirmation for your records</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* M-Pesa Payment Modal */}
            {showPaymentModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all">
                        <div className="text-center mb-6">
                            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Smartphone className="w-8 h-8 text-green-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Pay with M-Pesa</h3>
                            <p className="text-sm text-gray-600">Enter your M-Pesa number to proceed</p>
                        </div>
                        <form onSubmit={handlePayment} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Phone Number <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="tel"
                                    required
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    placeholder="254712345678"
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-lg"
                                />
                                <p className="text-xs text-gray-500 mt-2">Format: 254XXXXXXXXX</p>
                            </div>
                            <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border-2 border-green-300">
                                <p className="text-sm text-gray-700 mb-1">Amount to Pay</p>
                                <p className="text-3xl font-bold text-green-600">
                                    KSh {tenant?.monthlyRent.toLocaleString() || 0}
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowPaymentModal(false);
                                        setPhoneNumber('');
                                    }}
                                    className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={paymentLoading}
                                    className="flex-1 px-4 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                                >
                                    {paymentLoading ? 'Processing...' : 'Pay Now'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Payment;
