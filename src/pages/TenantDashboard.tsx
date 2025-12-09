import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { tenantsAPI, maintenanceAPI, notificationsAPI } from '../services/api';
import type { Tenant } from '../types';
import { Home, Wrench, DollarSign, FileText, Bell, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';

// Import page components
import RentSummary from './tenant/RentSummary';
import LeaseInfo from './tenant/LeaseInfo';
import Maintenance from './tenant/Maintenance';
import Notifications from './tenant/Notifications';
import Payment from './tenant/Payment';

type TabType = 'rent' | 'lease' | 'maintenance' | 'notifications' | 'payment';

const TenantDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [tenant, setTenant] = useState<Tenant | null>(null);
    const [loading, setLoading] = useState(true);
    const [requests, setRequests] = useState<any[]>([]);
    const [rentHistory, setRentHistory] = useState<any[]>([]);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<TabType>('rent');

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

    const tabs = [
        { id: 'rent' as TabType, label: 'Rent Summary', icon: DollarSign },
        { id: 'lease' as TabType, label: 'Lease Info', icon: FileText },
        { id: 'maintenance' as TabType, label: 'Maintenance', icon: Wrench },
        { id: 'notifications' as TabType, label: 'Notifications', icon: Bell },
        { id: 'payment' as TabType, label: 'Payment', icon: CreditCard }
    ];

    if (loading) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <Home className="w-7 h-7 text-primary-600" />
                        <div>
                            <span className="font-bold text-xl text-gray-900">Tenant Portal</span>
                            <p className="text-xs text-gray-500">Welcome back, {tenant?.name}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                        <button
                            onClick={handleLogout}
                            className="text-sm text-red-600 hover:text-red-700 font-semibold px-4 py-2 rounded-lg hover:bg-red-50 transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                </div>

                {/* Tabs Navigation */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex gap-1 overflow-x-auto scrollbar-hide">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-6 py-3 font-semibold text-sm whitespace-nowrap transition-all ${activeTab === tab.id
                                        ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 border-b-2 border-transparent'
                                        }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    {tab.label}
                                    {/* Badge for notifications */}
                                    {tab.id === 'notifications' && notifications.length > 0 && (
                                        <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                            {notifications.length}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Tab Content */}
                {activeTab === 'rent' && <RentSummary tenant={tenant} rentHistory={rentHistory} />}
                {activeTab === 'lease' && <LeaseInfo tenant={tenant} />}
                {activeTab === 'maintenance' && (
                    <Maintenance
                        tenant={tenant}
                        requests={requests}
                        onRequestsUpdate={setRequests}
                    />
                )}
                {activeTab === 'notifications' && <Notifications notifications={notifications} />}
                {activeTab === 'payment' && <Payment tenant={tenant} />}
            </main>
        </div>
    );
};

export default TenantDashboard;
