import mongoose, { Schema, Document } from 'mongoose';

export interface IMaintenanceRequest extends Document {
    propertyId: mongoose.Types.ObjectId;
    unitNumber: string;
    tenantName: string;
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
    createdAt: Date;
    updatedAt: Date;
}

const MaintenanceRequestSchema: Schema = new Schema(
    {
        propertyId: { type: Schema.Types.ObjectId, ref: 'Property', required: true },
        unitNumber: { type: String, required: true },
        tenantName: { type: String, required: true },
        title: { type: String, required: true },
        description: { type: String, required: true },
        priority: {
            type: String,
            required: true,
            enum: ['low', 'medium', 'high', 'urgent'],
            default: 'medium'
        },
        status: {
            type: String,
            required: true,
            enum: ['pending', 'in-progress', 'completed', 'cancelled'],
            default: 'pending'
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.model<IMaintenanceRequest>('MaintenanceRequest', MaintenanceRequestSchema);
