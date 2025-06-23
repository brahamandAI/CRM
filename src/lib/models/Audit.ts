import mongoose, { Document, Model } from 'mongoose';

export interface IAudit extends Document {
  client: mongoose.Types.ObjectId;
  date: Date;
  conductedBy: mongoose.Types.ObjectId;
  score: number;
  remarks: string;
  status: 'Pending' | 'Completed' | 'Failed';
  checklist: {
    item: string;
    status: 'Pass' | 'Fail' | 'NA';
    comments?: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const AuditSchema = new mongoose.Schema({
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  date: { type: Date, required: true },
  conductedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  score: { type: Number, required: true, min: 0, max: 100 },
  remarks: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['Pending', 'Completed', 'Failed'],
    default: 'Pending'
  },
  checklist: [{
    item: { type: String, required: true },
    status: { 
      type: String, 
      enum: ['Pass', 'Fail', 'NA'],
      required: true 
    },
    comments: { type: String }
  }]
}, { timestamps: true });

// Delete the model if it exists to prevent OverwriteModelError
const Audit = (mongoose.models.Audit as Model<IAudit>) || mongoose.model<IAudit>('Audit', AuditSchema);

export default Audit; 