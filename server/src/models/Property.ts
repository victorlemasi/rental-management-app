import mongoose, { Schema, Document } from 'mongoose';

export interface IProperty extends Document {
    name: string;
    address: string;
    type: 'apartment' | 'house' | 'condo' | 'commercial';
    units: number;
    occupiedUnits: number;
    monthlyRent: number;
    status: 'active' | 'maintenance' | 'vacant';
    imageUrl?: string;
    amenities: string[];
    yearBuilt: number;
    createdAt: Date;
    updatedAt: Date;
}

const PropertySchema: Schema = new Schema(
    {
        name: { type: String, required: true },
        address: { type: String, required: true },
        type: {
            type: String,
            required: true,
            enum: ['apartment', 'house', 'condo', 'commercial']
        },
        units: { type: Number, required: true },
        occupiedUnits: { type: Number, required: true, default: 0 },
        monthlyRent: { type: Number, required: true },
        status: {
            type: String,
            required: true,
            enum: ['active', 'maintenance', 'vacant'],
            default: 'active'
        },
        imageUrl: { type: String },
        amenities: [{ type: String }],
        yearBuilt: { type: Number, required: true }
    },
    {
        timestamps: true
    }
);

export default mongoose.model<IProperty>('Property', PropertySchema);
