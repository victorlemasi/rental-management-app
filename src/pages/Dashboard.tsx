import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Users, Wrench, DollarSign, AlertTriangle, PieChart as PieChartIcon } from 'lucide-react';
import StatsCard from '../components/StatsCard';
import RevenueChart from '../components/RevenueChart';
import RecentActivity from '../components/RecentActivity';
import { useAuth } from '../context/AuthContext';
import { tenantsAPI, propertiesAPI, maintenanceAPI, paymentsAPI } from '../services/api';
import type { Tenant, Property, MaintenanceRequest, Payment } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [expiringLeases, setExpiringLeases] = useState<Tenant[]>([]);
    const [occupancyData, setOccupancyData] = useState<{ name: string; value: number }[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalProperties: 0,
        totalTenants: 0,
        maintenanceRequests: 0,
        totalRevenue: 0
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [tenants, properties, maintenanceRequests, payments] = await Promise.all([
                    tenantsAPI.getAll(),
                    propertiesAPI.getAll(),
                    maintenanceAPI.getAll(),
                    paymentsAPI.getAll()
                ]);

                // Calculate stats
                const totalProperties = properties.length;
                const totalTenants = tenants.length;
                const pendingMaintenance = maintenanceRequests.filter(
                    (req: MaintenanceRequest) => req.status === 'pending' || req.status === 'in-progress'
                ).length;
                const totalRevenue = payments.reduce((sum: number, payment: Payment) => sum + payment.amount, 0);

                setStats({
                    totalProperties,
                    totalTenants,
                    maintenanceRequests: pendingMaintenance,
                    totalRevenue
                });

                // Lease Alerts Logic
                const now = new Date();
                const thirtyDaysFromNow = new Date();
                thirtyDaysFromNow.setDate(now.getDate() + 30);

                const expiring = tenants.filter((tenant: Tenant) => {
                    const leaseEnd = new Date(tenant.leaseEnd);
                    return leaseEnd >= now && leaseEnd <= thirtyDaysFromNow;
                });
                setExpiringLeases(expiring);

                // Occupancy Logic
                const totalUnits = properties.reduce((sum: number, p: Property) => sum + p.units, 0);
                const occupiedUnits = properties.reduce((sum: number, p: Property) => sum + p.occupiedUnits, 0);
                const vacantUnits = totalUnits - occupiedUnits;

                setOccupancyData([
                    { name: 'Occupied', value: occupiedUnits },
                    { name: 'Vacant', value: vacantUnits }
                ]);

            } catch (error) {
                console.error('Failed to fetch dashboard data', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const COLORS = ['#10B981', '#EF4444'];

    if (loading) return <div className="p-8 text-center dark:text-white">Loading dashboard...</div>;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
                <p className="text-gray-500 mt-1 dark:text-gray-400">Welcome back {user?.name}, here's what's happening today.</p>
            </div>

            {/* Alerts Section */}
            {expiringLeases.length > 0 && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg dark:bg-yellow-900/20 dark:border-yellow-600">
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <AlertTriangle className="h-5 w-5 text-yellow-400 dark:text-yellow-500" />
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                                Leases Expiring Soon ({expiringLeases.length})
                            </h3>
                            <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                                <ul className="list-disc pl-5 space-y-1">
                                    {expiringLeases.map(tenant => (
                                        <li key={tenant._id}>
                                            {tenant.name} - Unit {tenant.unitNumber} (Ends: {new Date(tenant.leaseEnd).toLocaleDateString()})
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    label="Total Properties"
                    value={stats.totalProperties.toString()}
                    trend="+2"
                    trendUp={true}
                    icon={Building2}
                    color="bg-blue-500"
                />
                <StatsCard
                    label="Total Tenants"
                    value={stats.totalTenants.toString()}
                    trend="+5"
                    trendUp={true}
                    icon={Users}
                    color="bg-green-500"
                />
                <StatsCard
                    label="Open Requests"
                    value={stats.maintenanceRequests.toString()}
                    trend={stats.maintenanceRequests > 0 ? `-${stats.maintenanceRequests}` : "0"}
                    trendUp={stats.maintenanceRequests === 0}
                    icon={Wrench}
                    color="bg-orange-500"
                />
                <StatsCard
                    label="Total Revenue"
                    value={`KSh ${stats.totalRevenue.toLocaleString()}`}
                    trend="+12%"
                    trendUp={true}
                    icon={DollarSign}
                    color="bg-purple-500"
                />
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button
                    onClick={() => navigate('/properties')}
                    className="p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-all flex flex-col items-center justify-center gap-2 group dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700"
                >
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-full group-hover:bg-blue-100 transition-colors dark:bg-blue-900/30 dark:text-blue-400">
                        <Building2 className="w-6 h-6" />
                    </div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Add Property</span>
                </button>
                <button
                    onClick={() => navigate('/tenants')}
                    className="p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-all flex flex-col items-center justify-center gap-2 group dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700"
                >
                    <div className="p-3 bg-green-50 text-green-600 rounded-full group-hover:bg-green-100 transition-colors dark:bg-green-900/30 dark:text-green-400">
                        <Users className="w-6 h-6" />
                    </div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Add Tenant</span>
                </button>
                <button
                    onClick={() => navigate('/financials')}
                    className="p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-all flex flex-col items-center justify-center gap-2 group dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700"
                >
                    <div className="p-3 bg-purple-50 text-purple-600 rounded-full group-hover:bg-purple-100 transition-colors dark:bg-purple-900/30 dark:text-purple-400">
                        <DollarSign className="w-6 h-6" />
                    </div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Record Payment</span>
                </button>
                <button
                    onClick={() => navigate('/maintenance')}
                    className="p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-all flex flex-col items-center justify-center gap-2 group dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700"
                >
                    <div className="p-3 bg-orange-50 text-orange-600 rounded-full group-hover:bg-orange-100 transition-colors dark:bg-orange-900/30 dark:text-orange-400">
                        <Wrench className="w-6 h-6" />
                    </div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Maintenance</span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <RevenueChart />
                    <div className="bg-white p-6 rounded-xl border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2 dark:text-white">
                            <PieChartIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                            Occupancy Rate
                        </h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={occupancyData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {occupancyData.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
                <div>
                    <RecentActivity />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
