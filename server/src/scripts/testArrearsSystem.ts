import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Tenant from '../models/Tenant.js';
import RentHistory from '../models/RentHistory.js';

dotenv.config();

/**
 * Script to test and demonstrate the arrears carry-forward system
 * This script will:
 * 1. Find tenants with unpaid balances
 * 2. Show how arrears are carried forward to the next month
 * 3. Simulate rent generation with arrears
 */

const testArrearsCarryForward = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI as string);
        console.log('Connected to MongoDB\n');

        // Get current month in EAT (UTC+3)
        const now = new Date();
        const eatDate = new Date(now.getTime() + (3 * 60 * 60 * 1000));
        const currentMonth = eatDate.toISOString().slice(0, 7);

        // Calculate previous month
        const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const previousMonth = prevDate.toISOString().slice(0, 7);

        console.log(`Current Month (EAT): ${currentMonth}`);
        console.log(`Previous Month: ${previousMonth}\n`);

        // Find all active tenants
        const tenants = await Tenant.find({ status: 'active' });
        console.log(`Total Active Tenants: ${tenants.length}\n`);
        console.log('='.repeat(80));

        for (const tenant of tenants) {
            console.log(`\nTenant: ${tenant.name}`);
            console.log(`Email: ${tenant.email}`);
            console.log(`Monthly Rent: KSh ${tenant.monthlyRent}`);
            console.log(`Current Balance: KSh ${tenant.balance}`);
            console.log('-'.repeat(80));

            // Get previous month's rent record
            const prevRent = await RentHistory.findOne({
                tenantId: tenant._id,
                month: previousMonth
            });

            if (prevRent) {
                const unpaidAmount = prevRent.carriedForwardAmount - prevRent.amountPaid;
                const balance = prevRent.amountPaid - prevRent.carriedForwardAmount;

                console.log(`\nPrevious Month (${previousMonth}):`);
                console.log(`  Base Rent: KSh ${prevRent.amount}`);
                console.log(`  Previous Arrears: KSh ${prevRent.previousBalance}`);
                console.log(`  Previous Credits: KSh ${prevRent.creditBalance}`);
                console.log(`  Total Due (Carried Forward): KSh ${prevRent.carriedForwardAmount}`);
                console.log(`  Amount Paid: KSh ${prevRent.amountPaid}`);
                console.log(`  Status: ${prevRent.status}`);

                if (balance < 0) {
                    console.log(`  Unpaid Amount (Arrears): KSh ${Math.abs(balance)}`);
                    console.log(`\n  ⚠️  ARREARS DETECTED! KSh ${Math.abs(balance)} will be carried forward to ${currentMonth}`);
                } else if (balance > 0) {
                    console.log(`  Overpayment (Credit): KSh ${balance}`);
                    console.log(`\n  💰 CREDIT AVAILABLE! KSh ${balance} will be applied to ${currentMonth}`);
                } else {
                    console.log(`\n  ✓ No arrears - Previous month fully paid`);
                }
            } else {
                console.log(`\nNo rent record found for previous month (${previousMonth})`);
            }

            // Get current month's rent record
            const currentRent = await RentHistory.findOne({
                tenantId: tenant._id,
                month: currentMonth
            });

            if (currentRent) {
                console.log(`\nCurrent Month (${currentMonth}):`);
                console.log(`  Base Rent: KSh ${currentRent.amount}`);
                console.log(`  Arrears from Previous Month: KSh ${currentRent.previousBalance}`);
                console.log(`  Credits from Previous Month: KSh ${currentRent.creditBalance}`);
                console.log(`  Water: KSh ${currentRent.water || 0}`);
                console.log(`  Electricity: KSh ${currentRent.electricity || 0}`);
                console.log(`  Garbage: KSh ${currentRent.garbage || 0}`);
                console.log(`  Security: KSh ${currentRent.security || 0}`);
                console.log(`  ---`);
                console.log(`  Total Due (after Credits): KSh ${currentRent.carriedForwardAmount}`);
                console.log(`  Amount Paid: KSh ${currentRent.amountPaid}`);
                console.log(`  Remaining Balance: KSh ${currentRent.carriedForwardAmount - currentRent.amountPaid}`);
                console.log(`  Status: ${currentRent.status}`);

                if (currentRent.previousBalance > 0) {
                    console.log(`\n  📌 This month includes KSh ${currentRent.previousBalance} in arrears!`);
                }
                if (currentRent.creditBalance > 0) {
                    console.log(`  💰 Credit of KSh ${currentRent.creditBalance} has been applied!`);
                }
            } else {
                console.log(`\nNo rent record found for current month (${currentMonth})`);
                console.log(`  (Rent will be auto-generated with arrears/credits by the cron job)`);
            }

            console.log('='.repeat(80));
        }

        console.log('\n✓ Arrears & Credits analysis complete!');
        console.log('\nHow the system works:');
        console.log('1. Each month, the system checks the previous month\'s RentHistory');
        console.log('2. ARREARS: If unpaid balance exists (carriedForwardAmount > amountPaid)');
        console.log('   - The unpaid amount is stored in "previousBalance" for the new month');
        console.log('3. CREDITS: If overpayment exists (amountPaid > carriedForwardAmount)');
        console.log('   - The extra amount is stored in "creditBalance" for the new month');
        console.log('4. The "carriedForwardAmount" = base rent + utilities + arrears - credits');
        console.log('5. Payments are checked against "carriedForwardAmount" to determine status');
        console.log('6. Arrears carry forward until paid; Credits automatically reduce next month\n');

        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

testArrearsCarryForward();
