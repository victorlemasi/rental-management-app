import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Tenant from '../models/Tenant.js';
import RentHistory from '../models/RentHistory.js';

dotenv.config();

const fixBalances = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI as string);
        console.log('Connected to MongoDB');

        const tenants = await Tenant.find();
        console.log(`Found ${tenants.length} tenants to check.`);

        for (const tenant of tenants) {
            // Find all unpaid or partial rent records for this tenant
            const unpaidRecords = await RentHistory.find({
                tenantId: tenant._id,
                status: { $in: ['pending', 'partial'] }
            });

            // Calculate the correct balance
            let correctBalance = 0;
            for (const record of unpaidRecords) {
                correctBalance += (record.amount - record.amountPaid);
            }

            // Update if different
            if (tenant.balance !== correctBalance) {
                console.log(`Fixing balance for ${tenant.name}: ${tenant.balance} -> ${correctBalance}`);
                tenant.balance = correctBalance;
                await tenant.save();
            } else {
                console.log(`Balance correct for ${tenant.name}: ${tenant.balance}`);
            }
        }

        console.log('Balance correction complete.');
        process.exit(0);
    } catch (error) {
        console.error('Error fixing balances:', error);
        process.exit(1);
    }
};

fixBalances();
