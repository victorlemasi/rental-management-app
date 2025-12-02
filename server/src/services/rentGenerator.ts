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
                // Create new rent record
                const dueDate = new Date(now.getFullYear(), now.getMonth(), 5); // Due on the 5th

                await RentHistory.create({
                    tenantId: tenant._id,
                    propertyId: tenant.propertyId,
                    month: currentMonth,
                    amount: tenant.monthlyRent,
                    amountPaid: 0,
                    status: 'pending',
                    dueDate: dueDate
                });

                // Update tenant balance and current month
                tenant.balance += tenant.monthlyRent;
                tenant.currentMonth = currentMonth;
                tenant.paymentStatus = 'pending';
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
