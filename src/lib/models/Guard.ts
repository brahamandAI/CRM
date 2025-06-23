import mongoose, { Document, Model } from 'mongoose';

interface GPS {
  lat: number;
  lng: number;
}

interface Shift {
  date: Date;
  startTime: string;
  endTime: string;
  location?: string;
  checkedIn: boolean;
  checkedOut: boolean;
  gps?: GPS;
}

export interface IGuard extends Document {
  name: string;
  email: string;
  phone: string;
  address?: string;
  photo?: string;
  assignedClient?: mongoose.Types.ObjectId;
  shifts: Shift[];
  certifications: string[];
  status: 'Active' | 'Inactive';
  createdAt: Date;
  updatedAt: Date;
}

const ShiftSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  location: { type: String },
  checkedIn: { type: Boolean, default: false },
  checkedOut: { type: Boolean, default: false },
  gps: {
    lat: { type: Number },
    lng: { type: Number }
  }
});

const GuardSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  address: { type: String },
  photo: { type: String }, // URL or file path
  assignedClient: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  shifts: [ShiftSchema],
  certifications: [{ type: String }],
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
}, { timestamps: true });

// Delete the model if it exists to prevent OverwriteModelError
const Guard = (mongoose.models.Guard as Model<IGuard>) || mongoose.model<IGuard>('Guard', GuardSchema);

export default Guard; 