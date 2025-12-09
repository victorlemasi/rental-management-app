import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Trash2, History, Zap, Calendar } from 'lucide-react';
import { tenantsAPI, propertiesAPI } from '../services/api';
import type { Tenant, Property } from '../types';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
import RentHistoryModal from '../components/RentHistoryModal';
import AddUtilitiesModal from '../components/AddUtilitiesModal';

const Tenants = () => {
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [properties, setProperties] = useState<Property[]>([]);
    const [rentHistories, setRentHistories] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [historyModalOpen, setHistoryModalOpen] = useState(false);
    const [utilitiesModalOpen, setUtilitiesModalOpen] = useState(false);
    const [extendLeaseModalOpen, setExtendLeaseModalOpen] = useState(false);
    const [selectedTenant, setSelectedTenant] = useState<{ id: string; name: string; monthlyRent: number } | null>(null);
    const [extendLeaseData, setExtendLeaseData] = useState({ tenantId: '', tenantName: '', months: 1 });
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        propertyId: '',
        unitNumber: '',
        leaseStart: '',
        leaseEnd: '',
        monthlyRent: 0,
        status: 'active',
        paymentStatus: 'pending',
        password: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [tenantsData, propertiesData] = await Promise.all([
                tenantsAPI.getAll(),
                propertiesAPI.getAll()
            ]);
            setTenants(tenantsData);
            setProperties(propertiesData);

            // Fetch rent history for each tenant
            const histories: any = {};
            for (const tenant of tenantsData) {
                try {
                    const history = await tenantsAPI.getRentHistory(tenant._id);
                    histories[tenant._id] = history;
                } catch (error) {
                    console.error(`Failed to fetch history for tenant ${tenant._id}`, error);
                    histories[tenant._id] = [];
                }
            }
            setRentHistories(histories);
        } catch (err) {
            setError('Failed to load data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddTenant = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await tenantsAPI.create(formData);
            setIsModalOpen(false);
            fetchData();
            setFormData({
                name: '',
                email: '',
                phone: '',
                propertyId: '',
                unitNumber: '',
                leaseStart: '',
                leaseEnd: '',
                monthlyRent: 0,
                status: 'active',
                paymentStatus: 'pending',
                password: ''
            });
            setToast({ message: 'Tenant added successfully!', type: 'success' });
        } catch (err) {
            console.error('Failed to create tenant:', err);
            setToast({ message: 'Failed to create tenant', type: 'error' });
        }
    };

    const handleDeleteTenant = async (id: string) => {
        if (!confirm('Are you sure you want to delete this tenant?')) return;
        try {
            await tenantsAPI.delete(id);
            setTenants(tenants.filter(t => t._id !== id));
            setToast({ message: 'Tenant deleted successfully!', type: 'success' });
        } catch (err) {
            console.error('Failed to delete tenant:', err);
            setToast({ message: 'Failed to delete tenant', type: 'error' });
        }
    };

    const handleViewHistory = (tenant: Tenant) => {
        setSelectedTenant({ id: tenant._id, name: tenant.name, monthlyRent: tenant.monthlyRent });
        setHistoryModalOpen(true);
    };

    const handleAddUtilities = (tenant: Tenant) => {
        setSelectedTenant({ id: tenant._id, name: tenant.name, monthlyRent: tenant.monthlyRent });
        setUtilitiesModalOpen(true);
    };

    const handleExtendLease = (tenant: Tenant) => {
        setExtendLeaseData({ tenantId: tenant._id, tenantName: tenant.name, months: 1 });
        setExtendLeaseModalOpen(true);
    };

    const submitExtendLease = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await tenantsAPI.extendLease(extendLeaseData.tenantId, extendLeaseData.months);
            setExtendLeaseModalOpen(false);
            fetchData();
            setToast({ message: `Lease extended by ${extendLeaseData.months} month(s) successfully!`, type: 'success' });
        } catch (err) {
            console.error('Failed to extend lease:', err);
            setToast({ message: 'Failed to extend lease', type: 'error' });
        }
    };

    const filteredTenants = tenants.filter((tenant) =>
        tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tenant.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getPropertyName = (propertyId: string | Property) => {
        if (typeof propertyId === 'object' && propertyId !== null) {
            return propertyId.name;
        }
        const property = properties.find(p => p._id === propertyId);
        return property?.name || 'Unknown Property';
    };

    if (loading) return <div className="p-8 text-center">Loading tenants...</div>;

    return (
        <div className="space-y-6">
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Tenants</h1>
                    <p className="text-gray-500 mt-1">Manage your tenants and lease agreements</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Add Tenant
                </button>
            </div>

            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                    <div className="flex items-center">
                        <p className="text-red-700">{error}</p>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-4 justify-between">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search tenants..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700">
                        <Filter className="w-4 h-4" />
                        Filter
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tenant</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lease Period</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rent</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Previous Month</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance Due</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredTenants.map((tenant) => (
                                <tr key={tenant._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold">
                                                {tenant.name.charAt(0)}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{tenant.name}</div>
                                                <div className="text-sm text-gray-500">{tenant.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{getPropertyName(tenant.propertyId)}</div>
                                        <div className="text-sm text-gray-500">Unit {tenant.unitNumber}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {new Date(tenant.leaseStart).toLocaleDateString()} - {new Date(tenant.leaseEnd).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">KSh {tenant.monthlyRent.toLocaleString()}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {(() => {
                                            const history = rentHistories[tenant._id] || [];
                                            // Exclude current month (first record) to show only previous months
                                            const previousMonths = history.slice(1);

                                            if (previousMonths.length === 0) {
                                                return <div className="text-sm text-gray-400">No previous data</div>;
                                            }

                                            return (
                                                <div className="text-sm space-y-2 max-h-32 overflow-y-auto">
                                                    {previousMonths.map((record: any) => {
                                                        const balance = record.amount - record.amountPaid;
                                                        return (
                                                            <div key={record._id} className="border-b border-gray-100 pb-2 last:border-0">
                                                                <div className="text-xs font-medium text-gray-700 mb-1">
                                                                    {(() => {
                                                                        const [year, month] = record.month.split('-');
                                                                        const date = new Date(parseInt(year), parseInt(month) - 1, 15);
                                                                        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                                                                    })()}
                                                                </div>
                                                                <div className="flex justify-between gap-2 text-xs">
                                                                    <span className="text-gray-500">Due:</span>
                                                                    <span>KSh {record.amount.toLocaleString()}</span>
                                                                </div>
                                                                <div className="flex justify-between gap-2 text-xs">
                                                                    <span className="text-gray-500">Paid:</span>
                                                                    <span className="text-green-600">KSh {record.amountPaid.toLocaleString()}</span>
                                                                </div>
                                                                <div className="flex justify-between gap-2 text-xs font-semibold">
                                                                    <span>Balance:</span>
                                                                    <span className={balance > 0 ? 'text-red-600' : balance < 0 ? 'text-green-600' : 'text-gray-900'}>
                                                                        KSh {Math.abs(balance).toLocaleString()}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            );
                                        })()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm space-y-1">
                                            {/* Total Balance Due */}
                                            <div className="flex justify-between gap-4">
                                                <span className="font-semibold text-gray-900">
                                                    {tenant.balance > 0 ? 'Total Due:' : tenant.balance < 0 ? 'Overpayment:' : 'Balance:'}
                                                </span>
                                                <span className={`font-bold ${tenant.balance > 0 ? 'text-red-600' :
                                                    tenant.balance < 0 ? 'text-green-600' :
                                                        'text-gray-900'
                                                    }`}>
                                                    {tenant.balance < 0 ? '-' : ''}KSh {Math.abs(tenant.balance || 0).toLocaleString()}
                                                </span>
                                            </div>

                                            {/* Breakdown hint */}
                                            {tenant.balance > 0 && (
                                                <div className="text-xs text-gray-500 italic">
                                                    (Includes rent + utilities)
                                                </div>
                                            )}

                                            {/* Current Month */}
                                            <div className="text-xs text-gray-500 text-center pt-1 border-t border-gray-200">
                                                {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${tenant.status === 'active' ? 'bg-green-100 text-green-800' :
                                                tenant.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'}`}>
                                            {tenant.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${tenant.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                                                tenant.paymentStatus === 'partial' ? 'bg-orange-100 text-orange-800' :
                                                    tenant.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-red-100 text-red-800'}`}>
                                            {tenant.paymentStatus}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => handleExtendLease(tenant)}
                                                className="text-purple-600 hover:text-purple-900 p-2 hover:bg-purple-50 rounded-full transition-colors"
                                                title="Extend Lease"
                                            >
                                                <Calendar className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleAddUtilities(tenant)}
                                                className="text-yellow-600 hover:text-yellow-900 p-2 hover:bg-yellow-50 rounded-full transition-colors"
                                                title="Add Utilities"
                                            >
                                                <Zap className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleViewHistory(tenant)}
                                                className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded-full transition-colors"
                                                title="View Rent History"
                                            >
                                                <History className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteTenant(tenant._id)}
                                                className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-full transition-colors"
                                                title="Delete Tenant"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Add New Tenant"
            >
                <form onSubmit={handleAddTenant} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            placeholder="Leave blank for default: tenant123"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                            <input
                                type="tel"
                                required
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">Lease Start</label>
                            <input
                                type="date"
                                required
                                value={formData.leaseStart}
                                onChange={(e) => setFormData({ ...formData, leaseStart: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Lease End</label>
                            <input
                                type="date"
                                required
                                value={formData.leaseEnd}
                                onChange={(e) => setFormData({ ...formData, leaseEnd: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Rent ($)</label>
                        <input
                            type="number"
                            required
                            value={formData.monthlyRent}
                            onChange={(e) => setFormData({ ...formData, monthlyRent: parseInt(e.target.value) })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
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
                            Add Tenant
                        </button>
                    </div>
                </form>
            </Modal>

            <RentHistoryModal
                isOpen={historyModalOpen}
                onClose={() => setHistoryModalOpen(false)}
                tenantId={selectedTenant?.id || null}
                tenantName={selectedTenant?.name || ''}
            />

            <AddUtilitiesModal
                isOpen={utilitiesModalOpen}
                onClose={() => {
                    setUtilitiesModalOpen(false);
                    fetchData();
                }}
                tenantId={selectedTenant?.id || null}
                tenantName={selectedTenant?.name || ''}
                monthlyRent={selectedTenant?.monthlyRent || 0}
            />
            {/* Extend Lease Modal */}
            <Modal
                isOpen={extendLeaseModalOpen}
                onClose={() => setExtendLeaseModalOpen(false)}
                title={`Extend Lease - ${extendLeaseData.tenantName}`}
            >
                <form onSubmit={submitExtendLease} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Extend lease by (months)
                        </label>
                        <input
                            type="number"
                            min="1"
                            max="60"
                            required
                            value={extendLeaseData.months}
                            onChange={(e) => setExtendLeaseData({ ...extendLeaseData, months: parseInt(e.target.value) })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Enter the number of months to extend the lease (1-60)
                        </p>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-900">
                            <strong>Note:</strong> The lease end date will be extended by {extendLeaseData.months} month(s) from the current end date.
                        </p>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={() => setExtendLeaseModalOpen(false)}
                            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                        >
                            Extend Lease
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Tenants;
