import { useTenantContext } from '../components/TenantDataWrapper';
import Payment from './tenant/Payment';

const TenantPaymentPage = () => {
    const { tenant } = useTenantContext();
    return <Payment tenant={tenant} />;
};

export default TenantPaymentPage;
