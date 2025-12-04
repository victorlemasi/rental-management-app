import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Tenant from '../models/Tenant.js';
import RentHistory from '../models/RentHistory.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const ensureCurrentMonthRent = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI as string);
        console.log('Connected to MongoDB\n');

        // Get current month in EAT (UTC+3)
        const now = new Date();
        const eatDate = new Date(now.getTime() + (3 * 60 * 60 * 1000));
        const currentMonth = eatDate.toISOString().slice(0, 7); // YYYY-MM format

        console.log(`Current month (EAT): ${currentMonth}`);
        console.log(`Current date: ${new Date().toISOString()}\n`);

        // Get all active tenants
        const tenants = await Tenant.find({ status: 'active' });
        console.log(`Found ${tenants.length} active tenants\n`);

        for (const tenant of tenants) {
            console.log(`\n--- Tenant: ${tenant.name} ---`);

            // Check if there's a rent history for current month
            const currentMonthRecord = await RentHistory.findOne({
                tenantId: tenant._id,
                month: currentMonth
            });

            if (currentMonthRecord) {
                console.log(`✓ Rent record exists for ${currentMonth}`);
                console.log(`  Amount Due: KSh ${currentMonthRecord.amount}`);
                console.log(`  Amount Paid: KSh ${currentMonthRecord.amountPaid}`);
                console.log(`  Status: ${currentMonthRecord.status}`);
            } else {
                console.log(`✗ No rent record for ${currentMonth} - Creating one...`);

                // Create rent record for current month
                const dueDate = new Date();
                dueDate.setDate(5); // Due on the 5th
                if (dueDate < new Date()) {
                    dueDate.setMonth(dueDate.getMonth() + 1);
                }

                const newRecord = await RentHistory.create({
                    tenantId: tenant._id,
                    propertyId: tenant.propertyId,
                    month: currentMonth,
                    amount: tenant.monthlyRent,
                    amountPaid: 0,
                    water: 0,
                    electricity: 0,
                    garbage: 0,
                    security: 0,
                    status: 'pending',
                    dueDate: dueDate
                });

                console.log(`  Created rent record for ${currentMonth}`);
                console.log(`  Amount Due: KSh ${newRecord.amount}`);
                console.log(`  Due Date: ${newRecord.dueDate.toISOString().split('T')[0]}`);

                // Update tenant's current month
                tenant.currentMonth = currentMonth;
                await tenant.save();
                console.log(`  Updated tenant currentMonth to ${currentMonth}`);
            }

            // Show all rent history for this tenant
            const allHistory = await RentHistory.find({ tenantId: tenant._id }).sort({ month: -1 });
            console.log(`\n  All rent history (${allHistory.length} records):`);
            allHistory.forEach((record, index) => {
                console.log(`    ${index + 1}. ${record.month} - KSh ${record.amount} (Paid: KSh ${record.amountPaid}) [${record.status}]`);
            });
        }

        console.log('\n\n✓ Completed!');
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

ensureCurrentMonthRent();
