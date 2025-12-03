import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Tenant from '../models/Tenant.js';
import RentHistory from '../models/RentHistory.js';

dotenv.config();

const checkAllMonths = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI as string);
        console.log('Connected to MongoDB');

        // Get all tenants
        const tenants = await Tenant.find();
        console.log(`\nTotal tenants: ${tenants.length}`);

        console.log('\n=== ALL RENT HISTORY RECORDS ===\n');

        for (const tenant of tenants) {
            const allRecords = await RentHistory.find({ tenantId: tenant._id }).sort({ month: -1 });

            console.log(`Tenant: ${tenant.name} (${tenant.email})`);
            console.log(`Total records: ${allRecords.length}`);

            if (allRecords.length > 0) {
                console.log('Months:');
                allRecords.forEach(record => {
                    console.log(`  - ${record.month}: KSh ${record.amount} (Paid: KSh ${record.amountPaid}, Status: ${record.status})`);
                });
            } else {
                console.log('  No records found');
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

checkAllMonths();
