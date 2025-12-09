import React from 'react';
import { DollarSign, Calendar, TrendingUp, FileText } from 'lucide-react';
import type { Tenant } from '../../types';

interface RentSummaryProps {
    tenant: Tenant | null;
    rentHistory: any[];
}

const RentSummary: React.FC<RentSummaryProps> = ({ tenant, rentHistory }) => {
    // Get current month record
    const currentMonth = new Date().toISOString().slice(0, 7);
    const currentMonthRecord = rentHistory.find(r => r.month === currentMonth);

    const water = currentMonthRecord?.water || 0;
    const electricity = currentMonthRecord?.electricity || 0;
    const garbage = currentMonthRecord?.garbage || 0;
    const security = currentMonthRecord?.security || 0;
    const totalUtilities = water + electricity + garbage + security;
    const arrears = currentMonthRecord?.previousBalance || 0;
    const credit = currentMonthRecord?.creditBalance || 0;
    const totalDue = currentMonthRecord?.carriedForwardAmount !== undefined
        ? currentMonthRecord.carriedForwardAmount
        : (tenant?.monthlyRent || 0) + totalUtilities;
    const amountPaid = currentMonthRecord?.amountPaid || 0;
    const outstanding = Math.max(0, totalDue - amountPaid);

    // Calculate payment statistics
    const totalPaidAllTime = rentHistory.reduce((sum, record) => sum + record.amountPaid, 0);
    const paidMonths = rentHistory.filter(r => r.status === 'paid').length;
    const partialMonths = rentHistory.filter(r => r.status === 'partial').overdue;

    return (
        <div className="space-y-6">
            {/* Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-100 text-sm font-medium mb-1">Monthly Rent</p>
                            <p className="text-3xl font-bold">KSh {(tenant?.monthlyRent || 0).toLocaleString()}</p>
                        </div>
                        <div className="bg-white/20 p-3 rounded-lg">
                            <DollarSign className="w-8 h-8" />
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-green-100 text-sm font-medium mb-1">Total Paid</p>
                            <p className="text-3xl font-bold">KSh {totalPaidAllTime.toLocaleString()}</p>
                        </div>
                        <div className="bg-white/20 p-3 rounded-lg">
                            <TrendingUp className="w-8 h-8" />
                        </div>
                    </div>
                    <p className="text-green-100 text-xs mt-2">All time payments</p>
                </div>

                <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-orange-100 text-sm font-medium mb-1">Outstanding</p>
                            <p className="text-3xl font-bold">KSh {outstanding.toLocaleString()}</p>
                        </div>
                        <div className="bg-white/20 p-3 rounded-lg">
                            <FileText className="w-8 h-8" />
                        </div>
                    </div>
                    <p className="text-orange-100 text-xs mt-2">Current month</p>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-purple-100 text-sm font-medium mb-1">Paid Months</p>
                            <p className="text-3xl font-bold">{paidMonths}/{rentHistory.length}</p>
                        </div>
                        <div className="bg-white/20 p-3 rounded-lg">
                            <Calendar className="w-8 h-8" />
                        </div>
                    </div>
                    <p className="text-purple-100 text-xs mt-2">Payment history</p>
                </div>
            </div>

            {/* Current Month Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left: Current Month Details */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-xl font-bold text-gray-900">Current Month Breakdown</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </p>
                    </div>
                    <div className="p-6 space-y-4">
                        {/* Base Rent */}
                        <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                            <span className="text-gray-600 font-medium">Base Rent</span>
                            <span className="text-lg font-bold text-gray-900">
                                KSh {(tenant?.monthlyRent || 0).toLocaleString()}
                            </span>
                        </div>

                        {/* Utilities */}
                        <div className="space-y-2">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Utilities</p>
                            <div className="grid grid-cols-2 gap-3 pl-3">
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Water</span>
                                    <span className="text-sm font-semibold text-gray-900">
                                        KSh {water.toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Electricity</span>
                                    <span className="text-sm font-semibold text-gray-900">
                                        KSh {electricity.toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Garbage</span>
                                    <span className="text-sm font-semibold text-gray-900">
                                        KSh {garbage.toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Security</span>
                                    <span className="text-sm font-semibold text-gray-900">
                                        KSh {security.toLocaleString()}
                                    </span>
                                </div>
                            </div>
                            <div className="flex justify-between pt-2 border-t border-gray-100">
                                <span className="text-sm font-medium text-gray-700">Total Utilities</span>
                                <span className="text-sm font-bold text-gray-900">
                                    KSh {totalUtilities.toLocaleString()}
                                </span>
                            </div>
                        </div>

                        {/* Arrears/Credits */}
                        {arrears > 0 && (
                            <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                                <span className="text-sm font-medium text-red-700">Previous Arrears</span>
                                <span className="text-lg font-bold text-red-600">
                                    +KSh {arrears.toLocaleString()}
                                </span>
                            </div>
                        )}
                        {credit > 0 && (
                            <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                                <span className="text-sm font-medium text-green-700">Credit Applied</span>
                                <span className="text-lg font-bold text-green-600">
                                    -KSh {credit.toLocaleString()}
                                </span>
                            </div>
                        )}

                        {/* Total Due */}
                        <div className="flex justify-between items-center pt-4 border-t-2 border-gray-300">
                            <span className="text-lg font-bold text-gray-900">Total Due</span>
                            <span className="text-2xl font-bold text-primary-600">
                                KSh {totalDue.toLocaleString()}
                            </span>
                        </div>

                        {/* Amount Paid */}
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600 font-medium">Amount Paid</span>
                            <span className="text-lg font-bold text-green-600">
                                KSh {amountPaid.toLocaleString()}
                            </span>
                        </div>

                        {/* Outstanding */}
                        <div className="flex justify-between items-center pb-4">
                            <span className="text-gray-600 font-medium">Outstanding</span>
                            <span className="text-lg font-bold text-red-600">
                                KSh {outstanding.toLocaleString()}
                            </span>
                        </div>

                        {/* Payment Status Badge */}
                        <div className="flex justify-center pt-4 border-t border-gray-200">
                            <span className={`px-6 py-2 rounded-full text-sm font-bold ${outstanding <= 0
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                {outstanding <= 0 ? '✓ PAID IN FULL' : 'PAYMENT PENDING'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Right: Payment Information */}
                <div className="space-y-6">
                    {/* Balance Overview */}
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Account Balance</h3>
                        <div className="bg-white rounded-lg p-6 text-center">
                            <p className="text-sm text-gray-600 mb-2">Total Amount Due</p>
                            <p className={`text-4xl font-bold ${(tenant?.balance || 0) > 0 ? 'text-orange-600' : 'text-green-600'
                                }`}>
                                KSh {Math.max(0, tenant?.balance || 0).toLocaleString()}
                            </p>
                            {tenant?.balance && tenant.balance > 0 ? (
                                <p className="text-sm text-orange-600 mt-3 font-medium">
                                    ⚠️ Payment required
                                </p>
                            ) : (
                                <p className="text-sm text-green-600 mt-3 font-medium">
                                    ✓ Account up to date
                                </p>
                            )}
                        </div>
                        <div className="mt-4 flex justify-center">
                            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${tenant?.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                                    tenant?.paymentStatus === 'partial' ? 'bg-orange-100 text-orange-800' :
                                        tenant?.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-red-100 text-red-800'
                                }`}>
                                {tenant?.paymentStatus?.toUpperCase() || 'PENDING'}
                            </span>
                        </div>
                    </div>

                    {/* Payment Account Information */}
                    {tenant?.propertyId && typeof tenant.propertyId === 'object' &&
                        (tenant.propertyId.paymentAccountNumber || tenant.propertyId.paymentAccountName) && (
                            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 rounded-xl shadow-sm p-6">
                                <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
                                    <DollarSign className="w-5 h-5" />
                                    Bank Transfer Details
                                </h3>
                                {tenant.propertyId.paymentAccountName && (
                                    <div className="mb-4">
                                        <p className="text-xs text-blue-700 font-medium mb-1">Account Name</p>
                                        <p className="text-base font-bold text-blue-900 bg-white px-3 py-2 rounded-lg">
                                            {tenant.propertyId.paymentAccountName}
                                        </p>
                                    </div>
                                )}
                                {tenant.propertyId.paymentAccountNumber && (
                                    <div className="mb-4">
                                        <p className="text-xs text-blue-700 font-medium mb-1">Account Number</p>
                                        <p className="text-xl font-bold text-blue-900 tracking-wider bg-white px-3 py-2 rounded-lg">
                                            {tenant.propertyId.paymentAccountNumber}
                                        </p>
                                    </div>
                                )}
                                <div className="bg-blue-200 rounded-lg p-3">
                                    <p className="text-xs text-blue-800 font-medium">
                                        💡 Use this account for bank transfers or mobile money payments
                                    </p>
                                </div>
                            </div>
                        )}
                </div>
            </div>

            {/* Payment History Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900">Payment History</h2>
                    <p className="text-sm text-gray-500 mt-1">Last 12 months of rent payments</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Month</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Base Rent</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Water</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Elec</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Garbage</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Security</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Arrears</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Credit</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Total Due</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Paid</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Due Date</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {rentHistory.length === 0 ? (
                                <tr>
                                    <td colSpan={12} className="px-6 py-8 text-center text-sm text-gray-500">
                                        No payment history found.
                                    </td>
                                </tr>
                            ) : (
                                rentHistory.map((record) => {
                                    const baseRent = record.amount - (record.water || 0) - (record.electricity || 0) - (record.garbage || 0) - (record.security || 0);
                                    const arrears = record.previousBalance || 0;
                                    const credit = record.creditBalance || 0;
                                    const totalDue = record.carriedForwardAmount !== undefined ? record.carriedForwardAmount : record.amount;
                                    return (
                                        <tr key={record._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {new Date(record.month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' })}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                KSh {baseRent.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                KSh {(record.water || 0).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                KSh {(record.electricity || 0).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                KSh {(record.garbage || 0).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                KSh {(record.security || 0).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                                                {arrears > 0 ? `KSh ${arrears.toLocaleString()}` : '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                                                {credit > 0 ? `-KSh ${credit.toLocaleString()}` : '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                                KSh {totalDue.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-bold">
                                                KSh {record.amountPaid.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${record.status === 'paid' ? 'bg-green-100 text-green-800' :
                                                        record.status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                                                            record.status === 'overdue' ? 'bg-red-100 text-red-800' :
                                                                'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {new Date(record.dueDate).toLocaleDateString('en-US', { timeZone: 'UTC' })}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default RentSummary;
