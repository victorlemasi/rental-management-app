import mongoose, { Schema, Document } from 'mongoose';

export interface ITenant extends Document {
    name: string;
    email: string;
    phone: string;
    propertyId: mongoose.Types.ObjectId;
    unitNumber: string;
    leaseStart: Date;
    leaseEnd: Date;
    monthlyRent: number;
    balance: number;
    currentMonth: string;
    status: 'active' | 'pending' | 'expired';
    paymentStatus: 'paid' | 'pending' | 'overdue' | 'partial';
    createdAt: Date;
    updatedAt: Date;
}

const TenantSchema: Schema = new Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String, required: true },
        propertyId: { type: Schema.Types.ObjectId, ref: 'Property', required: true },
        unitNumber: { type: String, required: true },
        leaseStart: { type: Date, required: true },
        leaseEnd: { type: Date, required: true },
        monthlyRent: { type: Number, required: true },
        balance: { type: Number, default: 0 },
        currentMonth: { type: String, default: () => new Date().toISOString().slice(0, 7) }, // YYYY-MM format
        status: {
            type: String,
            required: true,
            enum: ['active', 'pending', 'expired'],
            default: 'active'
        },
        paymentStatus: {
            type: String,
            required: true,
            enum: ['paid', 'pending', 'overdue', 'partial'],
            default: 'pending'
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.model<ITenant>('Tenant', TenantSchema);
