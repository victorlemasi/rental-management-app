import { useState, useEffect } from 'react';
import { tenantsAPI, propertiesAPI } from '../services/api';
import { DollarSign, Search, Download } from 'lucide-react';
import type { Tenant, Property } from '../types';

const Payments = () => {
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [properties, setProperties] = useState<Property[]>([]);
    const [rentHistories, setRentHistories] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTenant, setSelectedTenant] = useState<string>('all');

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
                    histories[tenant._id] = history.slice(0, 12); // Last 12 months
                } catch (error) {
                    console.error(`Failed to fetch history for tenant ${tenant._id}`, error);
                    histories[tenant._id] = [];
                }
            }
            setRentHistories(histories);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getPropertyName = (propertyId: string | Property) => {
        if (typeof propertyId === 'object' && propertyId !== null) {
            return propertyId.name;
        }
        const property = properties.find(p => p._id === propertyId);
        return property?.name || 'Unknown';
    };

    const filteredTenants = tenants.filter(tenant =>
        (selectedTenant === 'all' || tenant._id === selectedTenant) &&
        (tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tenant.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading) {
        return <div className="p-8 text-center">Loading payment history...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Payment History</h1>
                    <p className="text-gray-500 mt-1">Track all tenant payments month-over-month</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                    <Download className="w-5 h-5" />
                    Export
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search tenants..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                </div>
                <select
                    value={selectedTenant}
                    onChange={(e) => setSelectedTenant(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                    <option value="all">All Tenants</option>
                    {tenants.map(tenant => (
                        <option key={tenant._id} value={tenant._id}>{tenant.name}</option>
                    ))}
                </select>
            </div>

            {/* Payment History Table */}
            {filteredTenants.map(tenant => {
                const history = rentHistories[tenant._id] || [];
                if (history.length === 0) return null;

                return (
                    <div key={tenant._id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        {/* Tenant Header */}
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">{tenant.name}</h3>
                                    <p className="text-sm text-gray-500">
                                        {getPropertyName(tenant.propertyId)} - Unit {tenant.unitNumber}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-600">
                                        {tenant.balance > 0 ? 'Arrears' : tenant.balance < 0 ? 'Overpayment' : 'Balance'}
                                    </p>
                                    <p className={`text-2xl font-bold ${tenant.balance > 0 ? 'text-red-600' :
                                        tenant.balance < 0 ? 'text-green-600' :
                                            'text-gray-900'
                                        }`}>
                                        {tenant.balance < 0 ? '-' : ''}KSh {Math.abs(tenant.balance || 0).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Payment History Table */}
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Base Rent</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Water</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Elec</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Garbage</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Due</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paid</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {history.map((record: any) => {
                                        const baseRent = record.amount - (record.water || 0) - (record.electricity || 0) - (record.garbage || 0);
                                        return (
                                            <tr key={record._id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {new Date(record.month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    KSh {baseRent.toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {record.water ? `KSh ${record.water.toLocaleString()}` : '-'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {record.electricity ? `KSh ${record.electricity.toLocaleString()}` : '-'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {record.garbage ? `KSh ${record.garbage.toLocaleString()}` : '-'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    KSh {record.amount.toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                                                    KSh {record.amountPaid.toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${record.status === 'paid' ? 'bg-green-100 text-green-800' :
                                                        record.status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                                                            record.status === 'overdue' ? 'bg-red-100 text-red-800' :
                                                                'bg-gray-100 text-gray-800'
                                                        }`}>
                                                        {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {new Date(record.dueDate).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            })}

            {filteredTenants.length === 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                    <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No payment history found</p>
                </div>
            )}
        </div>
    );
};

export default Payments;
