import mongoose, { Schema, Document } from 'mongoose';

export interface IPayment extends Document {
    tenantId: mongoose.Types.ObjectId;
    tenantName: string;
    propertyName: string;
    amount: number;
    date: Date;
    status: 'completed' | 'pending' | 'failed';
    method: 'bank-transfer' | 'credit-card' | 'cash' | 'check' | 'mpesa';
    createdAt: Date;
    updatedAt: Date;
}

const PaymentSchema: Schema = new Schema(
    {
        tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
        tenantName: { type: String },
        propertyName: { type: String },
        amount: { type: Number, required: true },
        date: { type: Date, required: true },
        status: {
            type: String,
            required: true,
            enum: ['completed', 'pending', 'failed'],
            default: 'pending'
        },
        method: {
            type: String,
            required: true,
            enum: ['bank-transfer', 'credit-card', 'cash', 'check', 'mpesa']
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.model<IPayment>('Payment', PaymentSchema);
