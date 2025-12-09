import { useTenantContext } from '../components/TenantDataWrapper';
import RentSummary from './tenant/RentSummary';

const TenantRentPage = () => {
    const { tenant, rentHistory } = useTenantContext();
    return <RentSummary tenant={tenant} rentHistory={rentHistory} />;
};

export default TenantRentPage;
