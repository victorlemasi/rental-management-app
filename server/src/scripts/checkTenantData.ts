import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Tenant from '../models/Tenant.js';
import RentHistory from '../models/RentHistory.js';

dotenv.config();

const checkTenantData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI as string);
        console.log('Connected to MongoDB');

        // Get all tenants
        const tenants = await Tenant.find().select('name email unitNumber currentMonth balance');

        console.log('\n=== TENANTS ===');
        for (const tenant of tenants) {
            console.log(`\nTenant: ${tenant.name} (${tenant.email})`);
            console.log(`Unit: ${tenant.unitNumber}`);
            console.log(`Current Month: ${tenant.currentMonth}`);
            console.log(`Balance: KSh ${tenant.balance}`);

            // Get rent history for this tenant
            const rentHistories = await RentHistory.find({ tenantId: tenant._id })
                .sort({ month: -1 })
                .limit(3);

            console.log('\nRent History (last 3 months):');
            for (const record of rentHistories) {
                console.log(`  Month: ${record.month}`);
                console.log(`  Amount: KSh ${record.amount}`);
                console.log(`  Water: KSh ${record.water || 0}`);
                console.log(`  Electricity: KSh ${record.electricity || 0}`);
                console.log(`  Garbage: KSh ${record.garbage || 0}`);
                console.log(`  Security: KSh ${record.security || 0}`);
                console.log(`  Amount Paid: KSh ${record.amountPaid}`);
                console.log(`  Status: ${record.status}`);
                console.log(`  ---`);
            }
        }

        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB');
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkTenantData();
