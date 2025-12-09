import { useTenantContext } from '../components/TenantDataWrapper';
import LeaseInfo from './tenant/LeaseInfo';

const TenantLeasePage = () => {
    const { tenant } = useTenantContext();
    return <LeaseInfo tenant={tenant} />;
};

export default TenantLeasePage;
