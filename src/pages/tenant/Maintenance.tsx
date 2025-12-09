import React, { useState } from 'react';
import { Wrench, Clock, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { maintenanceAPI } from '../../services/api';
import type { Tenant } from '../../types';

interface MaintenanceProps {
    tenant: Tenant | null;
    requests: any[];
    onRequestsUpdate: (requests: any[]) => void;
}

const Maintenance: React.FC<MaintenanceProps> = ({ tenant, requests, onRequestsUpdate }) => {
    const [newRequest, setNewRequest] = useState({ title: '', description: '', priority: 'medium' });
    const [submitting, setSubmitting] = useState(false);

    const submitRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!tenant) return;

        setSubmitting(true);
        try {
            const requestData = {
                ...newRequest,
                propertyId: typeof tenant.propertyId === 'object' ? tenant.propertyId._id : tenant.propertyId,
                unitNumber: tenant.unitNumber,
                tenantName: tenant.name,
                status: 'pending'
            };
            await maintenanceAPI.create(requestData);
            alert('Request submitted successfully! We will get back to you soon.');
            setNewRequest({ title: '', description: '', priority: 'medium' });
            // Refresh requests
            const updatedRequests = await maintenanceAPI.getMyRequests();
            onRequestsUpdate(updatedRequests);
        } catch (error) {
            alert('Failed to submit request. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const getPriorityBadge = (priority: string) => {
        const badges = {
            low: 'bg-blue-100 text-blue-800',
            medium: 'bg-yellow-100 text-yellow-800',
            high: 'bg-orange-100 text-orange-800',
            urgent: 'bg-red-100 text-red-800'
        };
        return badges[priority as keyof typeof badges] || badges.medium;
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed':
                return <CheckCircle className="w-5 h-5 text-green-600" />;
            case 'in-progress':
                return <Clock className="w-5 h-5 text-blue-600" />;
            case 'cancelled':
                return <XCircle className="w-5 h-5 text-red-600" />;
            default:
                return <AlertCircle className="w-5 h-5 text-yellow-600" />;
        }
    };

    const getStatusBadge = (status: string) => {
        const badges = {
            pending: 'bg-yellow-100 text-yellow-800',
            'in-progress': 'bg-blue-100 text-blue-800',
            completed: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800'
        };
        return badges[status as keyof typeof badges] || badges.pending;
    };

    // Statistics
    const pendingCount = requests.filter(r => r.status === 'pending').length;
    const inProgressCount = requests.filter(r => r.status === 'in-progress').length;
    const completedCount = requests.filter(r => r.status === 'completed').length;

    return (
        <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Requests</p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white">{requests.length}</p>
                        </div>
                        <div className="bg-gray-100 dark:bg-slate-800 p-3 rounded-lg">
                            <Wrench className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-yellow-100 mb-1">Pending</p>
                            <p className="text-3xl font-bold">{pendingCount}</p>
                        </div>
                        <AlertCircle className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-blue-100 mb-1">In Progress</p>
                            <p className="text-3xl font-bold">{inProgressCount}</p>
                        </div>
                        <Clock className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-green-100 mb-1">Completed</p>
                            <p className="text-3xl font-bold">{completedCount}</p>
                        </div>
                        <CheckCircle className="w-6 h-6" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* New Request Form */}
                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 sticky top-6">
                        <div className="p-6 border-b border-gray-200 dark:border-slate-800">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Wrench className="w-6 h-6 text-primary-600" />
                                New Request
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Submit a maintenance request</p>
                        </div>
                        <form onSubmit={submitRequest} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Issue Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={newRequest.title}
                                    onChange={(e) => setNewRequest({ ...newRequest, title: e.target.value })}
                                    placeholder="e.g., Leaking faucet"
                                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Description <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    required
                                    rows={4}
                                    value={newRequest.description}
                                    onChange={(e) => setNewRequest({ ...newRequest, description: e.target.value })}
                                    placeholder="Describe the issue in detail..."
                                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Priority <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={newRequest.priority}
                                    onChange={(e) => setNewRequest({ ...newRequest, priority: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-gray-900 dark:text-white"
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                    <option value="urgent">Urgent</option>
                                </select>
                            </div>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                            >
                                {submitting ? 'Submitting...' : 'Submit Request'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Requests List */}
                <div className="lg:col-span-2">
                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800">
                        <div className="p-6 border-b border-gray-200 dark:border-slate-800">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">My Requests</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Track all your maintenance requests</p>
                        </div>
                        <div className="p-6">
                            {requests.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="bg-gray-100 dark:bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Wrench className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">No maintenance requests found</p>
                                    <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Submit your first request using the form</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {requests.map((req) => (
                                        <div
                                            key={req._id}
                                            className="border border-gray-200 dark:border-slate-700 rounded-xl p-5 hover:shadow-md transition-all bg-gradient-to-r from-gray-50 to-white dark:from-slate-800 dark:to-slate-800/50"
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1">
                                                    <div className="flex items-start gap-3 mb-3">
                                                        {getStatusIcon(req.status)}
                                                        <div className="flex-1">
                                                            <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-1">{req.title}</h3>
                                                            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{req.description}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-wrap items-center gap-3 ml-8">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusBadge(req.status)}`}>
                                                            {req.status.replace('-', ' ').toUpperCase()}
                                                        </span>
                                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${getPriorityBadge(req.priority)}`}>
                                                            {req.priority.toUpperCase()} PRIORITY
                                                        </span>
                                                        <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                                            <Clock className="w-3 h-3" />
                                                            {new Date(req.createdAt).toLocaleDateString('en-US', {
                                                                month: 'short',
                                                                day: 'numeric',
                                                                year: 'numeric'
                                                            })}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Resolution/Notes (if any) */}
                                            {req.notes && (
                                                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700 ml-8">
                                                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                                                        Management Notes
                                                    </p>
                                                    <p className="text-sm text-gray-700 dark:text-gray-300 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                                                        {req.notes}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Maintenance;
