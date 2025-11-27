import Property from './models/Property.js';
import Tenant from './models/Tenant.js';
import MaintenanceRequest from './models/MaintenanceRequest.js';
import Payment from './models/Payment.js';
import connectDB from './config/database.js';

const seedDatabase = async () => {
    try {
        await connectDB();

        // Clear existing data
        await Property.deleteMany({});
        await Tenant.deleteMany({});
        await MaintenanceRequest.deleteMany({});
        await Payment.deleteMany({});

        console.log('Cleared existing data');

        // Seed Properties
        const properties = await Property.insertMany([
            {
                name: 'Sunset Apartments',
                address: '123 Main St, Downtown',
                type: 'apartment',
                units: 24,
                occupiedUnits: 22,
                monthlyRent: 28800,
                status: 'active',
                amenities: ['Parking', 'Gym', 'Pool', 'Laundry'],
                yearBuilt: 2018,
            },
            {
                name: 'Oak Street Condos',
                address: '456 Oak St, Midtown',
                type: 'condo',
                units: 12,
                occupiedUnits: 10,
                monthlyRent: 15000,
                status: 'active',
                amenities: ['Parking', 'Security', 'Elevator'],
                yearBuilt: 2020,
            },
            {
                name: 'Riverside House',
                address: '789 River Rd, Westside',
                type: 'house',
                units: 1,
                occupiedUnits: 1,
                monthlyRent: 2500,
                status: 'active',
                amenities: ['Garden', 'Garage', 'Fireplace'],
                yearBuilt: 2015,
            },
            {
                name: 'Downtown Plaza',
                address: '321 Commerce Blvd, Downtown',
                type: 'commercial',
                units: 8,
                occupiedUnits: 6,
                monthlyRent: 12000,
                status: 'maintenance',
                amenities: ['Parking', 'Security', '24/7 Access'],
                yearBuilt: 2010,
            },
        ]);

        console.log('Seeded properties');

        // Seed Tenants
        const tenants = await Tenant.insertMany([
            {
                name: 'Sarah Wilson',
                email: 'sarah.w@email.com',
                phone: '(555) 123-4567',
                propertyId: properties[0]._id,
                unitNumber: '4B',
                leaseStart: new Date('2024-01-01'),
                leaseEnd: new Date('2025-12-31'),
                monthlyRent: 1200,
                status: 'active',
                paymentStatus: 'paid',
            },
            {
                name: 'Michael Chen',
                email: 'mchen@email.com',
                phone: '(555) 234-5678',
                propertyId: properties[0]._id,
                unitNumber: '2A',
                leaseStart: new Date('2024-03-01'),
                leaseEnd: new Date('2025-02-28'),
                monthlyRent: 1500,
                status: 'active',
                paymentStatus: 'pending',
            },
            {
                name: 'Emily Rodriguez',
                email: 'emily.r@email.com',
                phone: '(555) 345-6789',
                propertyId: properties[1]._id,
                unitNumber: '3C',
                leaseStart: new Date('2024-02-15'),
                leaseEnd: new Date('2026-02-14'),
                monthlyRent: 1800,
                status: 'active',
                paymentStatus: 'paid',
            },
        ]);

        console.log('Seeded tenants');

        // Seed Maintenance Requests
        await MaintenanceRequest.insertMany([
            {
                propertyId: properties[0]._id,
                unitNumber: '2A',
                tenantName: 'Michael Chen',
                title: 'Leaking Faucet',
                description: 'Kitchen faucet is dripping constantly',
                priority: 'medium',
                status: 'in-progress',
            },
            {
                propertyId: properties[0]._id,
                unitNumber: '4B',
                tenantName: 'Sarah Wilson',
                title: 'AC Not Working',
                description: 'Air conditioning unit not cooling properly',
                priority: 'high',
                status: 'pending',
            },
            {
                propertyId: properties[1]._id,
                unitNumber: '3C',
                tenantName: 'Emily Rodriguez',
                title: 'Light Fixture Replacement',
                description: 'Bedroom light fixture needs replacement',
                priority: 'low',
                status: 'completed',
            },
        ]);

        console.log('Seeded maintenance requests');

        // Seed Payments
        await Payment.insertMany([
            {
                tenantId: tenants[0]._id,
                tenantName: 'Sarah Wilson',
                propertyName: 'Sunset Apartments - 4B',
                amount: 1200,
                date: new Date('2024-11-01'),
                status: 'completed',
                method: 'bank-transfer',
            },
            {
                tenantId: tenants[2]._id,
                tenantName: 'Emily Rodriguez',
                propertyName: 'Oak Street Condos - 3C',
                amount: 1800,
                date: new Date('2024-11-01'),
                status: 'completed',
                method: 'credit-card',
            },
            {
                tenantId: tenants[1]._id,
                tenantName: 'Michael Chen',
                propertyName: 'Sunset Apartments - 2A',
                amount: 1500,
                date: new Date('2024-11-05'),
                status: 'pending',
                method: 'bank-transfer',
            },
        ]);

        console.log('Seeded payments');
        console.log('✅ Database seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();
