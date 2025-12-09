import { useEffect, useState } from 'react';
import { User, Wrench, DollarSign } from 'lucide-react';
import { paymentsAPI, maintenanceAPI, tenantsAPI } from '../services/api';
import type { Payment, MaintenanceRequest, Tenant } from '../types';

interface Activity {
    id: string;
    type: 'payment' | 'maintenance' | 'tenant';
    title: string;
    description: string;
    time: Date;
    icon: any;
    color: string;
}

const RecentActivity = () => {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecentActivity = async () => {
            try {
                const [payments, maintenanceRequests, tenants] = await Promise.all([
                    paymentsAPI.getAll(),
                    maintenanceAPI.getAll(),
                    tenantsAPI.getAll()
                ]);

                const allActivities: Activity[] = [];

                // Add recent payments (last 5)
                payments
                    .sort((a: Payment, b: Payment) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .slice(0, 5)
                    .forEach((payment: Payment) => {
                        allActivities.push({
                            id: `payment-${payment._id}`,
                            type: 'payment',
                            title: 'Rent Payment Received',
                            description: `${payment.tenantName} paid KSh ${payment.amount.toLocaleString()}`,
                            time: new Date(payment.date),
                            icon: DollarSign,
                            color: 'bg-green-100 text-green-600',
                        });
                    });

                // Add recent maintenance requests (last 5)
                maintenanceRequests
                    .sort((a: MaintenanceRequest, b: MaintenanceRequest) =>
                        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                    )
                    .slice(0, 5)
                    .forEach((request: MaintenanceRequest) => {
                        allActivities.push({
                            id: `maintenance-${request._id}`,
                            type: 'maintenance',
                            title: `${request.status === 'pending' ? 'New' : 'Updated'} Maintenance Request`,
                            description: `${request.title} - Unit ${request.unitNumber}`,
                            time: new Date(request.createdAt),
                            icon: Wrench,
                            color: 'bg-orange-100 text-orange-600',
                        });
                    });

                // Add recent tenant registrations (last 5)
                tenants
                    .sort((a: Tenant, b: Tenant) =>
                        new Date(b.leaseStart).getTime() - new Date(a.leaseStart).getTime()
                    )
                    .slice(0, 5)
                    .forEach((tenant: Tenant) => {
                        allActivities.push({
                            id: `tenant-${tenant._id}`,
                            type: 'tenant',
                            title: 'New Tenant Registered',
                            description: `${tenant.name} - Unit ${tenant.unitNumber}`,
                            time: new Date(tenant.leaseStart),
                            icon: User,
                            color: 'bg-blue-100 text-blue-600',
                        });
                    });

                // Sort all activities by time and take the most recent 6
                const sortedActivities = allActivities
                    .sort((a, b) => b.time.getTime() - a.time.getTime())
                    .slice(0, 6);

                setActivities(sortedActivities);
            } catch (error) {
                console.error('Failed to fetch recent activity', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRecentActivity();
    }, []);

    const getTimeAgo = (date: Date) => {
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        return date.toLocaleDateString();
    };

    if (loading) {
        return (
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-full">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h3>
                <div className="text-center text-gray-500">Loading...</div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm h-full">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
            {activities.length === 0 ? (
                <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                    No recent activity
                </div>
            ) : (
                <div className="space-y-6">
                    {activities.map((activity) => (
                        <div key={activity.id} className="flex gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${activity.color}`}>
                                <activity.icon className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-900 dark:text-gray-100">{activity.title}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{activity.description}</p>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{getTimeAgo(activity.time)}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default RecentActivity;
