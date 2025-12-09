import { useState, useEffect } from 'react';
import { Outlet, useOutletContext } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { tenantsAPI, maintenanceAPI, notificationsAPI } from '../services/api';
import type { Tenant } from '../types';

export interface TenantContextType {
    tenant: Tenant | null;
    requests: any[];
    rentHistory: any[];
    notifications: any[];
    setRequests: React.Dispatch<React.SetStateAction<any[]>>;
    loading: boolean;
}

export const TenantDataWrapper = () => {
    const { user } = useAuth();
    const [tenant, setTenant] = useState<Tenant | null>(null);
    const [loading, setLoading] = useState(true);
    const [requests, setRequests] = useState<any[]>([]);
    const [rentHistory, setRentHistory] = useState<any[]>([]);
    const [notifications, setNotifications] = useState<any[]>([]);

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

    if (loading) return <div className="p-8 text-center">Loading...</div>;

    return <Outlet context={{ tenant, requests, rentHistory, notifications, setRequests, loading } satisfies TenantContextType} />;
};

export const useTenantContext = () => {
    return useOutletContext<TenantContextType>();
};
