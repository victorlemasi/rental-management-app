import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { tenantsAPI, maintenanceAPI, mpesaAPI } from '../services/api';
import type { Tenant } from '../types';
import { Home, Wrench, DollarSign, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TenantDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [tenant, setTenant] = useState<Tenant | null>(null);
    const [loading, setLoading] = useState(true);
    const [newRequest, setNewRequest] = useState({ title: '', description: '', priority: 'medium' });
    const [requests, setRequests] = useState<any[]>([]);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [paymentLoading, setPaymentLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [tenantData, requestsData] = await Promise.all([
                    tenantsAPI.getMe(),
                    maintenanceAPI.getMyRequests()
                ]);
                setTenant(tenantData);
                setRequests(requestsData);
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
        if (!tenant || !phoneNumber) return;

        setPaymentLoading(true);
        try {
            await mpesaAPI.initiateSTKPush({
                phoneNumber,
                amount: tenant.monthlyRent,
                email: tenant.email
            });
            alert('STK Push sent! Check your phone to complete payment.');
            setShowPaymentModal(false);
            setPhoneNumber('');
        } catch (error: any) {
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
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Home className="w-6 h-6 text-primary-600" />
                        <h1 className="text-xl font-bold text-gray-900">Tenant Portal</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600">Welcome, {user?.name}</span>
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
                                        <p className="font-medium text-primary-600">${tenant.monthlyRent}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Status</p>
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            {tenant.status}
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-gray-500">No lease information found. Please contact management.</p>
                            )}
                        </div>

                        {/* Maintenance Request Form */}
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
                    </div>

                    {/* Right Column - Balance */}
                    <div className="space-y-8">
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <DollarSign className="w-5 h-5 text-primary-600" />
                                Current Balance
                            </h2>
                            <div className="text-center py-8">
                                <p className="text-sm text-gray-500 mb-1">Amount Due</p>
                                <p className="text-4xl font-bold text-gray-900">
                                    ${tenant?.monthlyRent || 0}
                                </p>
                                <button
                                    onClick={() => setShowPaymentModal(true)}
                                    className="mt-6 w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
                                >
                                    Pay with M-Pesa
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Payment Modal */}
            {showPaymentModal && (
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
                                    ${tenant?.monthlyRent || 0}
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
            )}
        </div>
    );
};

export default TenantDashboard;
