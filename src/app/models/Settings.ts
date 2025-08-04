import mongoose, { Schema, Document } from 'mongoose';

export interface ISettings extends Document {
  deliveryCharge: number;
  taxRate: number;
  supportEmail: string;
  maintenanceMode: boolean;
  updatedAt: Date;
}

const SettingsSchema: Schema<ISettings> = new Schema(
  {
    deliveryCharge: {
      type: Number,
      required: true,
      default: 5.0,
    },
    taxRate: {
      type: Number,
      required: true,
      default: 0.1,
    },
    supportEmail: {
      type: String,
      required: true,
      default: 'support@example.com',
    },
    maintenanceMode: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const Settings = mongoose.models.Settings || mongoose.model<ISettings>('Settings', SettingsSchema);