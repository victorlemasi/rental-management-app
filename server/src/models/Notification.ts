import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
    title: string;
    message: string;
    type: 'info' | 'warning' | 'urgent' | 'announcement';
    recipientType: 'all' | 'specific';
    recipientIds: mongoose.Types.ObjectId[];
    senderId: mongoose.Types.ObjectId;
    senderName: string;
    read: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const NotificationSchema: Schema = new Schema(
    {
        title: { type: String, required: true },
        message: { type: String, required: true },
        type: {
            type: String,
            required: true,
            enum: ['info', 'warning', 'urgent', 'announcement'],
            default: 'info'
        },
        recipientType: {
            type: String,
            required: true,
            enum: ['all', 'specific'],
            default: 'all'
        },
        recipientIds: [{ type: Schema.Types.ObjectId, ref: 'Tenant' }],
        senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        senderName: { type: String, required: true },
        read: { type: Boolean, default: false }
    },
    {
        timestamps: true
    }
);

export default mongoose.model<INotification>('Notification', NotificationSchema);
