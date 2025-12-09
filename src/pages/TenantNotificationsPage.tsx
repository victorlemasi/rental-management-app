import { useTenantContext } from '../components/TenantDataWrapper';
import Notifications from './tenant/Notifications';
import { notificationsAPI } from '../services/api';

const TenantNotificationsPage = () => {
    const { notifications, setNotifications } = useTenantContext();

    const handleMarkAsRead = async (id: string) => {
        try {
            await notificationsAPI.markAsRead(id);
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
        } catch (error) {
            console.error('Failed to mark as read', error);
        }
    };

    return <Notifications notifications={notifications} onMarkAsRead={handleMarkAsRead} />;
};

export default TenantNotificationsPage;
