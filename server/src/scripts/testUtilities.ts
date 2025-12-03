import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Tenant from '../models/Tenant.js';
import RentHistory from '../models/RentHistory.js';

dotenv.config();

const addTestUtilities = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI as string);
        console.log('Connected to MongoDB');

        // Find the VIC tenant (the one with balance around 46k)
        const tenant = await Tenant.findOne({ email: 'vict@gmail.com' });

        if (!tenant) {
            console.log('Tenant not found');
            return;
        }

        console.log(`\nTenant: ${tenant.name}`);
        console.log(`Current Month: ${tenant.currentMonth}`);
        console.log(`Monthly Rent: KSh ${tenant.monthlyRent}`);

        // Find or create rent history for current month
        let rentHistory = await RentHistory.findOne({
            tenantId: tenant._id,
            month: tenant.currentMonth
        });

        if (rentHistory) {
            console.log(`\nFound existing rent history for ${tenant.currentMonth}`);
            console.log(`Current utilities:`);
            console.log(`  Water: KSh ${rentHistory.water || 0}`);
            console.log(`  Electricity: KSh ${rentHistory.electricity || 0}`);
            console.log(`  Garbage: KSh ${rentHistory.garbage || 0}`);
            console.log(`  Security: KSh ${rentHistory.security || 0}`);
            console.log(`  Total Amount: KSh ${rentHistory.amount}`);
        } else {
            console.log(`\nNo rent history found for ${tenant.currentMonth}, would create new one`);
        }

        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB');
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

addTestUtilities();
