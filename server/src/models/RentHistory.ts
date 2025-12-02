import mongoose, { Schema, Document } from 'mongoose';

export interface IRentHistory extends Document {
    tenantId: mongoose.Types.ObjectId;
    propertyId: mongoose.Types.ObjectId;
    month: string; // Format: YYYY-MM
    amount: number;
    amountPaid: number;
    status: 'paid' | 'pending' | 'partial' | 'overdue';
    dueDate: Date;
    createdAt: Date;
    updatedAt: Date;
}

const RentHistorySchema: Schema = new Schema(
    {
        tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
        propertyId: { type: Schema.Types.ObjectId, ref: 'Property', required: true },
        month: { type: String, required: true }, // YYYY-MM
        amount: { type: Number, required: true },
        amountPaid: { type: Number, default: 0 },
        status: {
            type: String,
            required: true,
            enum: ['paid', 'pending', 'partial', 'overdue'],
            default: 'pending'
        },
        dueDate: { type: Date, required: true }
    },
    {
        timestamps: true
    }
);

// Compound index to ensure one rent record per tenant per month
RentHistorySchema.index({ tenantId: 1, month: 1 }, { unique: true });

export default mongoose.model<IRentHistory>('RentHistory', RentHistorySchema);
