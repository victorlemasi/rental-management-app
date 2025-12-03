import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { tenantsAPI, maintenanceAPI, mpesaAPI, notificationsAPI } from '../services/api';
import type { Tenant } from '../types';
import { Home, Wrench, DollarSign, Clock, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';

const TenantDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [tenant, setTenant] = useState<Tenant | null>(null);
    const [loading, setLoading] = useState(true);
    const [newRequest, setNewRequest] = useState({ title: '', description: '', priority: 'medium' });
    const [requests, setRequests] = useState<any[]>([]);
    const [rentHistory, setRentHistory] = useState<any[]>([]);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [paymentLoading, setPaymentLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [tenantData, requestsData, notificationsData] = await Promise.all([
                    tenantsAPI.getMe(),
                    maintenanceAPI.getMyRequests(),
                    notificationsAPI.getMyNotifications()
                ]);
                setTenant(tenantData);
                setRequests(requestsData);
                setNotifications(notificationsData);

                // Fetch rent history if tenant data is available
                if (tenantData?._id) {
                    const history = await tenantsAPI.getRentHistory(tenantData._id);
                    setRentHistory(history);
                }
            } catch (error) {
                console.error('Failed to fetch dashboard data', error);
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchData();
    }, [user]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const submitRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!tenant) return;

        try {
            const requestData = {
                ...newRequest,
                propertyId: typeof tenant.propertyId === 'object' ? tenant.propertyId._id : tenant.propertyId,
                unitNumber: tenant.unitNumber,
                tenantName: tenant.name,
                status: 'pending'
            };
            await maintenanceAPI.create(requestData);
            alert('Request submitted successfully');
            setNewRequest({ title: '', description: '', priority: 'medium' });
            // Refresh requests
            const updatedRequests = await maintenanceAPI.getMyRequests();
            setRequests(updatedRequests);
        } catch (error) {
            alert('Failed to submit request');
        }
    };
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

    if (loading) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Home className="w-6 h-6 text-primary-600" />
                        <span className="font-bold text-xl text-gray-900">Tenant Portal</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                        <span className="text-sm text-gray-600">Welcome, {tenant?.name}</span>
                        <button
                            onClick={handleLogout}
                            className="text-sm text-red-600 hover:text-red-700 font-medium"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Info */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Lease Info */}
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-primary-600" />
                                Lease Information
                            </h2>
                            {tenant ? (
                                <div>
                                    {typeof tenant.propertyId === 'object' && tenant.propertyId.imageUrl && (
                                        <div className="mb-6 rounded-lg overflow-hidden h-48 w-full">
                                            <img
                                                src={tenant.propertyId.imageUrl}
                                                alt={tenant.propertyId.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    )}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-500">Property</p>
                                            <p className="font-medium text-gray-900">
                                                {typeof tenant.propertyId === 'object' ? tenant.propertyId.name : 'Loading...'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Unit</p>
                                            <p className="font-medium text-gray-900">{tenant.unitNumber}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Lease Start</p>
                                            <p className="font-medium text-gray-900">{new Date(tenant.leaseStart).toLocaleDateString()}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Lease End</p>
                                            <p className="font-medium text-gray-900">{new Date(tenant.leaseEnd).toLocaleDateString()}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Monthly Rent</p>
                                            <p className="font-medium text-primary-600">KSh {tenant.monthlyRent}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Status</p>
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                {tenant.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-gray-500">No lease information found. Please contact management.</p>
                            )}
                        </div>

                        {/* Payment History Section */}
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <DollarSign className="w-5 h-5 text-primary-600" />
                                Payment History (Last 12 Months)
                            </h2>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead>
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Base Rent</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Water</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Elec</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Garbage</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Security</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Due</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paid</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {rentHistory.length === 0 ? (
                                            <tr>
                                                <td colSpan={10} className="px-4 py-4 text-center text-sm text-gray-500">
                                                    No payment history found.
                                                </td>
                                            </tr>
                                        ) : (
                                            rentHistory.map((record) => {
                                                const baseRent = record.amount - (record.water || 0) - (record.electricity || 0) - (record.garbage || 0) - (record.security || 0);
                                                return (
                                                    <tr key={record._id}>
                                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                                            {new Date(record.month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                                            KSh {baseRent.toLocaleString()}
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                                            KSh {(record.water || 0).toLocaleString()}
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                                            KSh {(record.electricity || 0).toLocaleString()}
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                                            KSh {(record.garbage || 0).toLocaleString()}
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                                            KSh {(record.security || 0).toLocaleString()}
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                                            KSh {record.amount.toLocaleString()}
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-green-600 font-medium">
                                                            KSh {record.amountPaid.toLocaleString()}
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap">
                                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${record.status === 'paid' ? 'bg-green-100 text-green-800' :
                                                                record.status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                                                                    record.status === 'overdue' ? 'bg-red-100 text-red-800' :
                                                                        'bg-gray-100 text-gray-800'
                                                                }`}>
                                                                {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                                            {new Date(record.dueDate).toLocaleDateString()}
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>



                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Wrench className="w-5 h-5 text-primary-600" />
                                Request Maintenance
                            </h2>
                            <form onSubmit={submitRequest} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Issue Title</label>
                                    <input
                                        type="text"
                                        required
                                        value={newRequest.title}
                                        onChange={(e) => setNewRequest({ ...newRequest, title: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea
                                        required
                                        rows={3}
                                        value={newRequest.description}
                                        onChange={(e) => setNewRequest({ ...newRequest, description: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                                    <select
                                        value={newRequest.priority}
                                        onChange={(e) => setNewRequest({ ...newRequest, priority: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                        <option value="urgent">Urgent</option>
                                    </select>
                                </div>
                                <button
                                    type="submit"
                                    className="w-full bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 transition-colors"
                                >
                                    Submit Request
                                </button>
                            </form>
                        </div>

                        {/* My Requests List */}
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">My Requests</h2>
                            <div className="space-y-4">
                                {requests.length === 0 ? (
                                    <p className="text-gray-500 text-center py-4">No maintenance requests found.</p>
                                ) : (
                                    requests.map((req) => (
                                        <div key={req._id} className="border border-gray-200 rounded-lg p-4">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="font-medium text-gray-900">{req.title}</h3>
                                                    <p className="text-sm text-gray-500 mt-1">{req.description}</p>
                                                    <p className="text-xs text-gray-400 mt-2">
                                                        {new Date(req.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${req.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                    req.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                                                        'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {req.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Notifications */}
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Bell className="w-5 h-5 text-primary-600" />
                                Notifications
                            </h2>
                            <div className="space-y-3">
                                {notifications.length === 0 ? (
                                    <p className="text-gray-500 text-center py-4">No notifications</p>
                                ) : (
                                    notifications.map((notification) => (
                                        <div
                                            key={notification._id}
                                            className={`border-l-4 rounded-lg p-4 ${notification.type === 'urgent' ? 'border-red-500 bg-red-50' :
                                                notification.type === 'warning' ? 'border-orange-500 bg-orange-50' :
                                                    notification.type === 'announcement' ? 'border-blue-500 bg-blue-50' :
                                                        'border-green-500 bg-green-50'
                                                }`}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                                                    <p className="text-sm text-gray-700 mt-1">{notification.message}</p>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <p className="text-xs text-gray-500">
                                                            From: {notification.senderName}
                                                        </p>
                                                        <span className="text-xs text-gray-400">•</span>
                                                        <p className="text-xs text-gray-500">
                                                            {new Date(notification.createdAt).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${notification.type === 'urgent' ? 'bg-red-100 text-red-800' :
                                                    notification.type === 'warning' ? 'bg-orange-100 text-orange-800' :
                                                        notification.type === 'announcement' ? 'bg-blue-100 text-blue-800' :
                                                            'bg-green-100 text-green-800'
                                                    }`}>
                                                    {notification.type}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Balance */}
                    <div className="space-y-8">
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <DollarSign className="w-5 h-5 text-primary-600" />
                                Rent Summary
                            </h2>
                            <div className="space-y-6">
                                {/* Current Month */}
                                <div className="text-center pb-4 border-b border-gray-200">
                                    <p className="text-sm text-gray-500 mb-1">Current Period</p>
                                    <p className="text-lg font-semibold text-gray-900">
                                        {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                    </p>
                                </div>


                                {/* Base Rent */}
                                <div className="flex justify-between items-center">
                                    <p className="text-sm text-gray-600">Rent Amount</p>
                                    <p className="text-lg font-semibold text-gray-900">
                                        KSh {tenant?.monthlyRent.toLocaleString() || 0}
                                    </p>
                                </div>

                                {/* Utilities Breakdown (Current Month) */}
                                {(() => {
                                    // Use actual current calendar month instead of tenant.currentMonth
                                    const currentMonth = new Date().toISOString().slice(0, 7);
                                    const currentMonthRecord = rentHistory.find(r => r.month === currentMonth);

                                    const water = currentMonthRecord?.water || 0;
                                    const electricity = currentMonthRecord?.electricity || 0;
                                    const garbage = currentMonthRecord?.garbage || 0;
                                    const security = currentMonthRecord?.security || 0;
                                    const totalUtilities = water + electricity + garbage + security;
                                    const currentMonthTotal = (tenant?.monthlyRent || 0) + totalUtilities;
                                    const amountPaid = currentMonthRecord?.amountPaid || 0;

                                    return (
                                        <>
                                            {/* Utilities Header */}
                                            <div className="pt-2 border-t border-gray-200">
                                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Utilities</p>

                                                {/* Water */}
                                                <div className="flex justify-between items-center text-sm mb-1">
                                                    <p className="text-gray-600 pl-2">Water</p>
                                                    <p className="font-medium text-gray-900">
                                                        KSh {water.toLocaleString()}
                                                    </p>
                                                </div>

                                                {/* Electricity */}
                                                <div className="flex justify-between items-center text-sm mb-1">
                                                    <p className="text-gray-600 pl-2">Electricity</p>
                                                    <p className="font-medium text-gray-900">
                                                        KSh {electricity.toLocaleString()}
                                                    </p>
                                                </div>

                                                {/* Garbage */}
                                                <div className="flex justify-between items-center text-sm mb-1">
                                                    <p className="text-gray-600 pl-2">Garbage</p>
                                                    <p className="font-medium text-gray-900">
                                                        KSh {garbage.toLocaleString()}
                                                    </p>
                                                </div>

                                                {/* Security */}
                                                <div className="flex justify-between items-center text-sm">
                                                    <p className="text-gray-600 pl-2">Security</p>
                                                    <p className="font-medium text-gray-900">
                                                        KSh {security.toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Total Utilities */}
                                            <div className="flex justify-between items-center pt-2">
                                                <p className="text-sm font-medium text-gray-700">Total Utilities</p>
                                                <p className="text-lg font-semibold text-gray-900">
                                                    KSh {totalUtilities.toLocaleString()}
                                                </p>
                                            </div>

                                            {/* Current Month Total */}
                                            <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                                                <p className="text-sm font-semibold text-gray-900">Total (This Month)</p>
                                                <p className="text-xl font-bold text-primary-600">
                                                    KSh {currentMonthTotal.toLocaleString()}
                                                </p>
                                            </div>

                                            {/* Amount Paid */}
                                            <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                                                <p className="text-sm text-gray-600">Amount Paid</p>
                                                <p className="text-lg font-semibold text-green-600">
                                                    KSh {amountPaid.toLocaleString()}
                                                </p>
                                            </div>

                                            {/* Amount Due */}
                                            <div className="flex justify-between items-center pt-2">
                                                <p className="text-sm text-gray-600">Amount Due</p>
                                                <p className="text-lg font-semibold text-red-600">
                                                    KSh {Math.max(0, currentMonthTotal - amountPaid).toLocaleString()}
                                                </p>
                                            </div>

                                            {/* Payment Status */}
                                            <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                                                <p className="text-sm font-medium text-gray-700">Payment Status</p>
                                                <span className={`px-3 py-1 rounded-full text-sm font-bold ${(currentMonthTotal - amountPaid) <= 0
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {(currentMonthTotal - amountPaid) <= 0 ? 'PAID' : 'PENDING'}
                                                </span>
                                            </div>
                                        </>
                                    );
                                })()}

                                {/* Balance Due */}
                                <div className="bg-gray-50 rounded-lg p-4 mt-4">
                                    <p className="text-sm text-gray-600 mb-2">Amount Due</p>
                                    <p className={`text-3xl font-bold ${(tenant?.balance || 0) > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                                        KSh {Math.max(0, tenant?.balance || 0).toLocaleString()}
                                    </p>
                                    {tenant?.balance && tenant.balance > 0 && (
                                        <p className="text-xs text-orange-600 mt-2">
                                            Payment required
                                        </p>
                                    )}
                                    {tenant?.balance && tenant.balance <= 0 && (
                                        <p className="text-xs text-green-600 mt-2">
                                            ✓ Fully paid
                                        </p>
                                    )}
                                </div>


                                {/* Payment Status Badge */}
                                <div className="flex justify-center">
                                    <span className={`px-4 py-2 rounded-full text-sm font-semibold ${tenant?.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                                        tenant?.paymentStatus === 'partial' ? 'bg-orange-100 text-orange-800' :
                                            tenant?.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800'
                                        }`}>
                                        {tenant?.paymentStatus?.toUpperCase() || 'PENDING'}
                                    </span>
                                </div>

                                {/* Payment Account Information */}
                                {tenant?.propertyId && typeof tenant.propertyId === 'object' &&
                                    (tenant.propertyId.paymentAccountNumber || tenant.propertyId.paymentAccountName) && (
                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                            <h3 className="text-sm font-semibold text-blue-900 mb-3">Bank Transfer Details</h3>
                                            {tenant.propertyId.paymentAccountName && (
                                                <div className="mb-2">
                                                    <p className="text-xs text-blue-700">Account Name</p>
                                                    <p className="text-sm font-semibold text-blue-900">
                                                        {tenant.propertyId.paymentAccountName}
                                                    </p>
                                                </div>
                                            )}
                                            {tenant.propertyId.paymentAccountNumber && (
                                                <div>
                                                    <p className="text-xs text-blue-700">Account Number</p>
                                                    <p className="text-lg font-bold text-blue-900 tracking-wide">
                                                        {tenant.propertyId.paymentAccountNumber}
                                                    </p>
                                                </div>
                                            )}
                                            <p className="text-xs text-blue-600 mt-3">
                                                Use this account for bank transfers or mobile money payments
                                            </p>
                                        </div>
                                    )}

                                <button
                                    onClick={() => setShowPaymentModal(true)}
                                    className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors"
                                >
                                    Pay with M-Pesa
                                </button>
                            </div>
                        </div>
                    </div>
                </div >
            </main >

            {/* Payment Modal */}
            {
                showPaymentModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">Pay Rent with M-Pesa</h3>
                            <form onSubmit={handlePayment} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        required
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        placeholder="254712345678"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Format: 254XXXXXXXXX</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-600">Amount to Pay</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        KSh {tenant?.monthlyRent || 0}
                                    </p>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowPaymentModal(false);
                                            setPhoneNumber('');
                                        }}
                                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={paymentLoading}
                                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {paymentLoading ? 'Processing...' : 'Pay Now'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default TenantDashboard;
