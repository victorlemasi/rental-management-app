import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Tenant from '../models/Tenant.js';

dotenv.config();

const updateCurrentMonth = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI as string);
        console.log('Connected to MongoDB');

        const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
        console.log(`\nUpdating all tenants to current month: ${currentMonth}`);

        const result = await Tenant.updateMany(
            {}, // Update all tenants
            { $set: { currentMonth: currentMonth } }
        );

        console.log(`\nUpdated ${result.modifiedCount} tenants to ${currentMonth}`);

        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB');
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

updateCurrentMonth();
