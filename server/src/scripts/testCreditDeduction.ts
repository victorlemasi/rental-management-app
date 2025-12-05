import mongoose from 'mongoose';
import dotenv from 'dotenv';
import RentHistory from '../models/RentHistory.js';

dotenv.config();

/**
 * Script to verify that credits are properly deducted from rent + utilities
 */

const testCreditWithUtilities = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI as string);
        console.log('Connected to MongoDB\n');

        // Find a rent record with credits
        const rentWithCredit = await RentHistory.findOne({
            creditBalance: { $gt: 0 }
        });

        if (rentWithCredit) {
            console.log('Found rent record with credit:\n');
            console.log(`Month: ${rentWithCredit.month}`);
            console.log(`Base Rent + Utilities: KSh ${rentWithCredit.amount.toLocaleString()}`);
            console.log(`Previous Arrears: KSh ${rentWithCredit.previousBalance.toLocaleString()}`);
            console.log(`Credit Balance: KSh ${rentWithCredit.creditBalance.toLocaleString()}`);
            console.log('─'.repeat(50));

            const calculatedTotal = rentWithCredit.amount + rentWithCredit.previousBalance - rentWithCredit.creditBalance;
            console.log(`Calculated Total: ${rentWithCredit.amount} + ${rentWithCredit.previousBalance} - ${rentWithCredit.creditBalance} = KSh ${calculatedTotal.toLocaleString()}`);
            console.log(`Stored Total (carriedForwardAmount): KSh ${rentWithCredit.carriedForwardAmount.toLocaleString()}`);
            console.log('─'.repeat(50));

            if (Math.abs(calculatedTotal - rentWithCredit.carriedForwardAmount) < 0.01) {
                console.log('✅ VERIFIED: Credit is correctly deducted from total (rent + utilities)!');
            } else {
                console.log('❌ MISMATCH: Credit calculation may have an issue');
            }

            // Show breakdown
            console.log('\nDetailed Breakdown:');
            console.log(`Water: KSh ${rentWithCredit.water || 0}`);
            console.log(`Electricity: KSh ${rentWithCredit.electricity || 0}`);
            console.log(`Garbage: KSh ${rentWithCredit.garbage || 0}`);
            console.log(`Security: KSh ${rentWithCredit.security || 0}`);
            const utilities = (rentWithCredit.water || 0) + (rentWithCredit.electricity || 0) +
                (rentWithCredit.garbage || 0) + (rentWithCredit.security || 0);
            const baseRent = rentWithCredit.amount - utilities;
            console.log(`\nBase Rent: KSh ${baseRent.toLocaleString()}`);
            console.log(`Total Utilities: KSh ${utilities.toLocaleString()}`);
            console.log(`Amount (Rent + Utilities): KSh ${rentWithCredit.amount.toLocaleString()}`);
            console.log(`Credit Applied: -KSh ${rentWithCredit.creditBalance.toLocaleString()}`);
            console.log(`Final Amount Due: KSh ${rentWithCredit.carriedForwardAmount.toLocaleString()}`);

        } else {
            console.log('No rent records with credits found.');
            console.log('Creating a test scenario...\n');

            // Test the calculation logic
            const testRent = 15000;
            const testUtilities = 2500;
            const testCredit = 5000;
            const testArrears = 0;

            const amount = testRent + testUtilities;
            const totalBeforeCredit = amount + testArrears;
            const carriedForwardAmount = Math.max(0, totalBeforeCredit - testCredit);

            console.log('Test Calculation:');
            console.log(`Base Rent: KSh ${testRent.toLocaleString()}`);
            console.log(`Utilities: KSh ${testUtilities.toLocaleString()}`);
            console.log(`Subtotal: KSh ${amount.toLocaleString()}`);
            console.log(`Credit: -KSh ${testCredit.toLocaleString()}`);
            console.log(`Total Due: KSh ${carriedForwardAmount.toLocaleString()}`);
            console.log('\n✅ Formula: (rent + utilities + arrears) - credit = final amount');
        }

        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB');
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

testCreditWithUtilities();
