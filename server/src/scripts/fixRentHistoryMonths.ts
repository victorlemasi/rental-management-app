import mongoose from 'mongoose';
import dotenv from 'dotenv';
import RentHistory from '../models/RentHistory.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const fixRentHistoryMonths = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI as string);
        console.log('Connected to MongoDB');

        // Get current month in EAT (UTC+3)
        const now = new Date();
        const eatDate = new Date(now.getTime() + (3 * 60 * 60 * 1000));
        const currentMonth = eatDate.toISOString().slice(0, 7); // YYYY-MM format

        console.log(`\nCurrent month (EAT): ${currentMonth}`);
        console.log('Searching for rent history records with old months...\n');

        // Find all rent history records where the month is NOT the current month
        // and the status is 'pending' or 'partial' (unpaid records)
        const oldRecords = await RentHistory.find({
            month: { $ne: currentMonth },
            status: { $in: ['pending', 'partial'] }
        });

        console.log(`Found ${oldRecords.length} records with outdated months`);

        if (oldRecords.length === 0) {
            console.log('No records need updating.');
            await mongoose.disconnect();
            return;
        }

        // Update each record
        let updated = 0;
        for (const record of oldRecords) {
            console.log(`\nUpdating record for tenant ${record.tenantId}`);
            console.log(`  Old month: ${record.month}`);
            console.log(`  New month: ${currentMonth}`);
            console.log(`  Amount: KSh ${record.amount}`);
            console.log(`  Paid: KSh ${record.amountPaid}`);

            record.month = currentMonth;

            // Update due date to current month
            const dueDate = new Date();
            dueDate.setDate(5); // Due on the 5th
            if (dueDate < new Date()) {
                dueDate.setMonth(dueDate.getMonth() + 1);
            }
            record.dueDate = dueDate;

            await record.save();
            updated++;
        }

        console.log(`\n✓ Successfully updated ${updated} rent history records to ${currentMonth}`);

        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB');
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

fixRentHistoryMonths();
