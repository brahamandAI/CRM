import mongoose, { Document, Model } from 'mongoose';

export interface IIncident extends Document {
  type: string;
  location: string;
  description: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Active' | 'Resolved' | 'Under Investigation';
  date: Date;
  client: mongoose.Types.ObjectId;
  guard: mongoose.Types.ObjectId;
  reportedBy: mongoose.Types.ObjectId;
  resolution?: string;
  createdAt: Date;
  updatedAt: Date;
}

const IncidentSchema = new mongoose.Schema({
  type: { type: String, required: true },
  location: { type: String, required: true },
  description: { type: String, required: true },
  severity: { 
    type: String, 
    enum: ['Low', 'Medium', 'High', 'Critical'],
    required: true 
  },
  status: { 
    type: String, 
    enum: ['Active', 'Resolved', 'Under Investigation'],
    default: 'Active'
  },
  date: { type: Date, required: true },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  guard: { type: mongoose.Schema.Types.ObjectId, ref: 'Guard', required: true },
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  resolution: { type: String },
}, { timestamps: true });

// Delete the model if it exists to prevent OverwriteModelError
const Incident = (mongoose.models.Incident as Model<IIncident>) || mongoose.model<IIncident>('Incident', IncidentSchema);

export default Incident; 