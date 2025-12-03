import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Tenant from '../models/Tenant.js';
import RentHistory from '../models/RentHistory.js';

dotenv.config();

const checkDecemberRecords = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI as string);
        console.log('Connected to MongoDB');

        const currentMonth = '2025-12';

        // Get all tenants
        const tenants = await Tenant.find();
        console.log(`\nTotal tenants: ${tenants.length}`);

        // Check December records for each tenant
        console.log('\n=== DECEMBER 2025 RENT RECORDS ===\n');

        for (const tenant of tenants) {
            const decRecord = await RentHistory.findOne({
                tenantId: tenant._id,
                month: currentMonth
            });

            console.log(`Tenant: ${tenant.name}`);
            console.log(`Email: ${tenant.email}`);
            console.log(`Current Month (tenant.currentMonth): ${tenant.currentMonth}`);

            if (decRecord) {
                console.log(`✅ December Record EXISTS`);
                console.log(`   - Amount: KSh ${decRecord.amount}`);
                console.log(`   - Amount Paid: KSh ${decRecord.amountPaid}`);
                console.log(`   - Water: KSh ${decRecord.water}`);
                console.log(`   - Electricity: KSh ${decRecord.electricity}`);
                console.log(`   - Garbage: KSh ${decRecord.garbage}`);
                console.log(`   - Security: KSh ${decRecord.security}`);
                console.log(`   - Status: ${decRecord.status}`);
                console.log(`   - Due Date: ${decRecord.dueDate}`);
            } else {
                console.log(`❌ NO December Record found`);

                // Check what records exist
                const allRecords = await RentHistory.find({ tenantId: tenant._id }).sort({ month: -1 });
                console.log(`   Available months: ${allRecords.map(r => r.month).join(', ')}`);
            }
            console.log('---\n');
        }

        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkDecemberRecords();
