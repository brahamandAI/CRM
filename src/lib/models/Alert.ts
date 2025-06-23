import mongoose, { Document, Model } from 'mongoose';

export interface IAlert extends Document {
  title: string;
  description: string;
  type: 'Emergency' | 'Security' | 'Maintenance' | 'Information';
  priority: 'High' | 'Medium' | 'Low';
  status: 'Active' | 'Resolved' | 'Investigating' | 'Dismissed';
  location: string;
  reportedBy: string;
  assignedTo?: string;
  actions: string[];
  notifyViaEmail: boolean;
  notifyViaSMS: boolean;
  notificationEmail?: string;
  notificationPhone?: string;
  user: mongoose.Types.ObjectId;
  client: mongoose.Types.ObjectId;
  guard: mongoose.Types.ObjectId;
  isRead: boolean;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AlertSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, required: true, enum: ['Emergency', 'Security', 'Maintenance', 'Information'] },
  priority: { type: String, required: true, enum: ['High', 'Medium', 'Low'] },
  status: { type: String, required: true, enum: ['Active', 'Resolved', 'Investigating', 'Dismissed'] },
  location: { type: String, required: true },
  reportedBy: { type: String, required: true },
  assignedTo: { type: String },
  actions: [String],
  notifyViaEmail: { type: Boolean, default: true },
  notifyViaSMS: { type: Boolean, default: false },
  notificationEmail: { type: String },
  notificationPhone: { type: String },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  guard: { type: mongoose.Schema.Types.ObjectId, ref: 'Guard' },
  isRead: { type: Boolean, default: false },
  resolvedAt: { type: Date },
}, { timestamps: true });

// Delete the model if it exists to prevent OverwriteModelError
const Alert = (mongoose.models.Alert as Model<IAlert>) || mongoose.model<IAlert>('Alert', AlertSchema);

export default Alert; 