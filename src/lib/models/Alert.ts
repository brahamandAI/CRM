import mongoose, { Document, Model } from 'mongoose';

export interface IAlert extends Document {
  title: string;
  description: string;
  type: 'Emergency' | 'Security' | 'Maintenance' | 'Information';
  priority: 'High' | 'Medium' | 'Low';
  status: 'Active' | 'Acknowledged' | 'Resolved';
  location: string;
  client: mongoose.Types.ObjectId;
  guard?: mongoose.Types.ObjectId;
  reportedBy: mongoose.Types.ObjectId;
  assignedTo?: mongoose.Types.ObjectId;
  notificationSettings: {
    email: boolean;
    sms: boolean;
    recipients: string[];
  };
  acknowledgement?: {
    by: mongoose.Types.ObjectId;
    at: Date;
    notes: string;
  };
  resolution?: {
    by: mongoose.Types.ObjectId;
    at: Date;
    notes: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const AlertSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  type: { 
    type: String, 
    enum: ['Emergency', 'Security', 'Maintenance', 'Information'],
    required: true 
  },
  priority: { 
    type: String, 
    enum: ['High', 'Medium', 'Low'],
    required: true 
  },
  status: { 
    type: String, 
    enum: ['Active', 'Acknowledged', 'Resolved'],
    default: 'Active'
  },
  location: { 
    type: String, 
    required: true 
  },
  client: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Client',
    required: true 
  },
  guard: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Guard'
  },
  reportedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  assignedTo: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User'
  },
  notificationSettings: {
    email: { 
      type: Boolean, 
      default: true 
    },
    sms: { 
      type: Boolean, 
      default: false 
    },
    recipients: [{ 
      type: String 
    }]
  },
  acknowledgement: {
    by: { 
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    at: { type: Date },
    notes: { type: String }
  },
  resolution: {
    by: { 
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    at: { type: Date },
    notes: { type: String }
  }
}, { 
  timestamps: true 
});

// Indexes for better query performance
AlertSchema.index({ title: 1 });
AlertSchema.index({ type: 1 });
AlertSchema.index({ priority: 1 });
AlertSchema.index({ status: 1 });
AlertSchema.index({ client: 1 });
AlertSchema.index({ guard: 1 });
AlertSchema.index({ createdAt: -1 });

const Alert = (mongoose.models.Alert as Model<IAlert>) || mongoose.model<IAlert>('Alert', AlertSchema);

export default Alert; 