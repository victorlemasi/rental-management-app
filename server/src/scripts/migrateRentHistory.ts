import mongoose from 'mongoose';
import dotenv from 'dotenv';
import RentHistory from '../models/RentHistory.js';

dotenv.config();

/**
 * Migration script to update existing RentHistory records
 * Sets carriedForwardAmount = amount + previousBalance for all records
 */

const migrateRentHistoryRecords = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI as string);
        console.log('Connected to MongoDB\n');

        // Find all rent history records
        const allRecords = await RentHistory.find({});
        console.log(`Total RentHistory records found: ${allRecords.length}\n`);

        let updated = 0;
        let skipped = 0;

        for (const record of allRecords) {
            // Check if carriedForwardAmount or creditBalance needs to be set
            if (record.carriedForwardAmount === undefined || record.carriedForwardAmount === 0 ||
                record.creditBalance === undefined) {

                // Set previousBalance to 0 if not set
                if (record.previousBalance === undefined) {
                    record.previousBalance = 0;
                }

                // Set creditBalance to 0 if not set
                if (record.creditBalance === undefined) {
                    record.creditBalance = 0;
                }

                // Calculate carriedForwardAmount = amount + previousBalance - creditBalance
                record.carriedForwardAmount = Math.max(0, record.amount + record.previousBalance - record.creditBalance);

                await record.save();
                updated++;

                console.log(`✓ Updated ${record.month} for tenant ${record.tenantId}`);
                console.log(`  Amount: KSh ${record.amount}`);
                console.log(`  Previous Balance: KSh ${record.previousBalance}`);
                console.log(`  Credit Balance: KSh ${record.creditBalance}`);
                console.log(`  Carried Forward: KSh ${record.carriedForwardAmount}\n`);
            } else {
                skipped++;
            }
        }

        console.log(`\n${'='.repeat(60)}`);
        console.log(`Migration complete!`);
        console.log(`  Records updated: ${updated}`);
        console.log(`  Records skipped: ${skipped}`);
        console.log(`${'='.repeat(60)}\n`);

        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

migrateRentHistoryRecords();
