import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { tenantsAPI, maintenanceAPI } from '../services/api';
import type { Tenant } from '../types';
import { Home, Wrench, DollarSign, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TenantDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [tenant, setTenant] = useState<Tenant | null>(null);
    const [loading, setLoading] = useState(true);
    const [newRequest, setNewRequest] = useState({ title: '', description: '', priority: 'medium' });

    useEffect(() => {
        const fetchData = async () => {
            try {
                // In a real app, we'd fetch "my tenant profile" based on logged in user
                // For now, we'll try to find a tenant with the same email
                const allTenants = await tenantsAPI.getAll();
                const myProfile = allTenants.find((t: Tenant) => t.email === user?.email);

                if (myProfile) {
                    setTenant(myProfile);
                    // Fetch maintenance requests for this tenant
                    // This would also ideally be a backend filter
                }
            } catch (error) {
                console.error('Failed to fetch tenant data', error);
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
            await maintenanceAPI.create({
                ...newRequest,
                propertyId: typeof tenant.propertyId === 'object' ? tenant.propertyId._id : tenant.propertyId,
                unitNumber: tenant.unitNumber,
                tenantName: tenant.name,
                status: 'pending'
            });
            alert('Request submitted successfully');
            setNewRequest({ title: '', description: '', priority: 'medium' });
        } catch (error) {
            alert('Failed to submit request');
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
                                <p className="text-4xl font-bold text-gray-900">$0.00</p>
                                <button className="mt-6 w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors">
                                    Make Payment
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default TenantDashboard;
