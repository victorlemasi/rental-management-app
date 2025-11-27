import { useState, useEffect } from 'react';
import { AlertCircle, Clock, CheckCircle, XCircle, Plus, Trash2 } from 'lucide-react';
import { maintenanceAPI, propertiesAPI } from '../services/api';
import type { MaintenanceRequest, Property } from '../types';
import Modal from '../components/Modal';

const Maintenance = () => {
    const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        propertyId: '',
        unitNumber: '',
        tenantName: '',
        title: '',
        description: '',
        priority: 'medium',
        status: 'pending'
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [requestsData, propertiesData] = await Promise.all([
                maintenanceAPI.getAll(),
                propertiesAPI.getAll()
            ]);
            setRequests(requestsData);
            setProperties(propertiesData);
        } catch (err) {
            setError('Failed to load data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await maintenanceAPI.create(formData);
            setIsModalOpen(false);
            fetchData();
            setFormData({
                propertyId: '',
                unitNumber: '',
                tenantName: '',
                title: '',
                description: '',
                priority: 'medium',
                status: 'pending'
            });
        } catch (err) {
            console.error('Failed to create request:', err);
            alert('Failed to create request');
        }
    };

    const handleDeleteRequest = async (id: string) => {
        if (!confirm('Are you sure you want to delete this request?')) return;
        try {
            await maintenanceAPI.delete(id);
            setRequests(requests.filter(r => r._id !== id));
        } catch (err) {
            console.error('Failed to delete request:', err);
            alert('Failed to delete request');
        }
    };

    const handleStatusUpdate = async (id: string, newStatus: string) => {
        try {
            await maintenanceAPI.update(id, { status: newStatus });
            setRequests(requests.map(r => r._id === id ? { ...r, status: newStatus as any } : r));
        } catch (err) {
            console.error('Failed to update status:', err);
            alert('Failed to update status');
        }
    };

    const filteredRequests = requests.filter((request) =>
        filterStatus === 'all' || request.status === filterStatus
    );

    const priorityColors = {
        low: 'bg-blue-100 text-blue-700',
        medium: 'bg-yellow-100 text-yellow-700',
        high: 'bg-orange-100 text-orange-700',
        urgent: 'bg-red-100 text-red-700',
    };

    const statusIcons = {
        pending: Clock,
        'in-progress': AlertCircle,
        completed: CheckCircle,
        cancelled: XCircle,
    };

    const statusColors = {
        pending: 'bg-yellow-100 text-yellow-700',
        'in-progress': 'bg-blue-100 text-blue-700',
        completed: 'bg-green-100 text-green-700',
        cancelled: 'bg-gray-100 text-gray-700',
    };

    if (loading) return <div className="p-8 text-center">Loading maintenance requests...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Maintenance Requests</h1>
                    <p className="text-gray-500 mt-1">Track and manage maintenance requests</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    New Request
                </button>
            </div>

            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                    <div className="flex items-center">
                        <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                        <p className="text-red-700">{error}</p>
                    </div>
                </div>
            )}

            <div className="bg-white p-4 rounded-xl border border-gray-200">
                <div className="flex gap-2 overflow-x-auto">
                    {['all', 'pending', 'in-progress', 'completed', 'cancelled'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${filterStatus === status
                                ? 'bg-primary-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {status === 'all' ? 'All' : status.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid gap-4">
                {filteredRequests.map((request) => {
                    const StatusIcon = statusIcons[request.status];
                    return (
                        <div key={request._id} className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-lg font-bold text-gray-900">{request.title}</h3>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${priorityColors[request.priority]}`}>
                                            {request.priority}
                                        </span>
                                    </div>
                                    <p className="text-gray-600 mb-3">{request.description}</p>
                                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                        <span>Unit: <strong className="text-gray-900">{request.unitNumber}</strong></span>
                                        <span>Tenant: <strong className="text-gray-900">{request.tenantName}</strong></span>
                                        <span>Created: <strong className="text-gray-900">{new Date(request.createdAt).toLocaleDateString()}</strong></span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <StatusIcon className="w-5 h-5" />
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[request.status]}`}>
                                        {request.status.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                                    </span>
                                    <button
                                        onClick={() => handleDeleteRequest(request._id)}
                                        className="ml-2 text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                {request.status === 'pending' && (
                                    <button
                                        onClick={() => handleStatusUpdate(request._id, 'in-progress')}
                                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                                    >
                                        Start Work
                                    </button>
                                )}
                                {request.status === 'in-progress' && (
                                    <button
                                        onClick={() => handleStatusUpdate(request._id, 'completed')}
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                                    >
                                        Mark Complete
                                    </button>
                                )}
                                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">
                                    View Details
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {filteredRequests.length === 0 && !loading && (
                <div className="text-center py-12">
                    <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No maintenance requests found</p>
                </div>
            )}

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="New Maintenance Request"
            >
                <form onSubmit={handleAddRequest} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                        <input
                            type="text"
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            placeholder="e.g. Leaky Faucet"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            required
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            rows={3}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Property</label>
                            <select
                                required
                                value={formData.propertyId}
                                onChange={(e) => setFormData({ ...formData, propertyId: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                                <option value="">Select Property</option>
                                {properties.map(p => (
                                    <option key={p._id} value={p._id}>{p.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Unit Number</label>
                            <input
                                type="text"
                                required
                                value={formData.unitNumber}
                                onChange={(e) => setFormData({ ...formData, unitNumber: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tenant Name</label>
                            <input
                                type="text"
                                required
                                value={formData.tenantName}
                                onChange={(e) => setFormData({ ...formData, tenantName: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                            <select
                                value={formData.priority}
                                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                                <option value="urgent">Urgent</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                        >
                            Create Request
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Maintenance;
