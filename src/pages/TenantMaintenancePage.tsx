import { useTenantContext } from '../components/TenantDataWrapper';
import Maintenance from './tenant/Maintenance';

const TenantMaintenancePage = () => {
    const { tenant, requests, setRequests } = useTenantContext();
    return <Maintenance tenant={tenant} requests={requests} onRequestsUpdate={setRequests} />;
};

export default TenantMaintenancePage;
