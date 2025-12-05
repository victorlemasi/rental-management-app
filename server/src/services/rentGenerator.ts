import cron from 'node-cron';
import Tenant from '../models/Tenant.js';
import RentHistory from '../models/RentHistory.js';

export const generateMonthlyRent = async () => {
    console.log('Running monthly rent generation job...');
    const now = new Date();
    const currentMonth = now.toISOString().slice(0, 7); // YYYY-MM

    try {
        // Find all active tenants
        const tenants = await Tenant.find({ status: 'active' });

        let generatedCount = 0;

        for (const tenant of tenants) {
            // Check if rent history already exists for this month
            const existingRent = await RentHistory.findOne({
                tenantId: tenant._id,
                month: currentMonth
            });

            if (!existingRent) {
                // Calculate previous month for arrears/credit check
                const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                const previousMonth = prevDate.toISOString().slice(0, 7);

                // Check for unpaid balance OR overpayment from previous month
                const previousRent = await RentHistory.findOne({
                    tenantId: tenant._id,
                    month: previousMonth
                });

                let arrears = 0;
                let creditAvailable = 0;

                if (previousRent) {
                    const balance = previousRent.amountPaid - previousRent.carriedForwardAmount;

                    if (balance < 0) {
                        // Unpaid balance (arrears)
                        arrears = Math.abs(balance);
                        console.log(`Tenant ${tenant.name}: Carrying forward arrears of KSh ${arrears} from ${previousMonth}`);
                    } else if (balance > 0) {
                        // Overpayment (credit)
                        creditAvailable = balance;
                        console.log(`Tenant ${tenant.name}: Applying credit of KSh ${creditAvailable} from ${previousMonth}`);
                    }
                }

                // Create new rent record with arrears/credits
                const dueDate = new Date(now.getFullYear(), now.getMonth(), 5); // Due on the 5th

                // Calculate total: base rent + arrears - credit
                const baseAmount = tenant.monthlyRent;
                const totalBeforeCredit = baseAmount + arrears;
                const totalAfterCredit = Math.max(0, totalBeforeCredit - creditAvailable);

                await RentHistory.create({
                    tenantId: tenant._id,
                    propertyId: tenant.propertyId,
                    month: currentMonth,
                    amount: tenant.monthlyRent,
                    amountPaid: 0,
                    previousBalance: arrears,
                    creditBalance: creditAvailable,
                    carriedForwardAmount: totalAfterCredit,
                    status: arrears > 0 ? 'overdue' : 'pending',
                    dueDate: dueDate
                });

                // Update tenant balance
                // If there's a credit, the tenant balance is reduced
                // If there are arrears, only add current month's rent (arrears already in balance)
                if (creditAvailable > 0) {
                    // Apply credit to reduce balance
                    tenant.balance = Math.max(0, tenant.balance - creditAvailable + tenant.monthlyRent);
                } else {
                    tenant.balance += tenant.monthlyRent;
                }

                tenant.currentMonth = currentMonth;
                tenant.paymentStatus = arrears > 0 ? 'overdue' : (creditAvailable >= baseAmount ? 'paid' : 'pending');
                await tenant.save();

                generatedCount++;
            }
        }

        console.log(`Rent generation complete. Generated for ${generatedCount} tenants.`);
    } catch (error) {
        console.error('Error generating monthly rent:', error);
    }
};

// Initialize cron job
export const initRentScheduler = () => {
    // Run every day at midnight to catch any missed generations (idempotent)
    // '0 0 * * *' = at 00:00 every day
    cron.schedule('0 0 * * *', () => {
        generateMonthlyRent();
    });

    console.log('Rent scheduler initialized (Runs daily at midnight)');
};
