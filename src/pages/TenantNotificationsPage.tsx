import { useTenantContext } from '../components/TenantDataWrapper';
import Notifications from './tenant/Notifications';

const TenantNotificationsPage = () => {
    const { notifications } = useTenantContext();
    return <Notifications notifications={notifications} />;
};

export default TenantNotificationsPage;
