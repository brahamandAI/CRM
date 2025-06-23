import mongoose, { Document, Model } from 'mongoose';

export interface IClient extends Document {
  name: string;
  address: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  contractStart: Date;
  contractEnd: Date;
  contractFile?: string;
  status: 'Active' | 'Expired';
  createdAt: Date;
  updatedAt: Date;
}

const ClientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  contactPerson: { type: String, required: true },
  contactEmail: { type: String, required: true },
  contactPhone: { type: String, required: true },
  contractStart: { type: Date, required: true },
  contractEnd: { type: Date, required: true },
  contractFile: { type: String }, // URL or file path
  status: { type: String, enum: ['Active', 'Expired'], default: 'Active' },
}, { timestamps: true });

// Delete the model if it exists to prevent OverwriteModelError
const Client = (mongoose.models.Client as Model<IClient>) || mongoose.model<IClient>('Client', ClientSchema);

export default Client; 