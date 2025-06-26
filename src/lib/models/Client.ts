import mongoose, { Document, Model } from 'mongoose';

export interface IClient extends Document {
  name: string;
  contact: string;
  email: string;
  phone: string;
  address: string;
  contractStartDate: Date;
  contractEndDate: Date;
  status: 'Active' | 'Inactive' | 'Pending';
  assignedGuards: mongoose.Types.ObjectId[];
  services: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ClientSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true 
  },
  contact: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    lowercase: true
  },
  phone: { 
    type: String, 
    required: true 
  },
  address: { 
    type: String, 
    required: true 
  },
  contractStartDate: { 
    type: Date, 
    required: true 
  },
  contractEndDate: { 
    type: Date, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['Active', 'Inactive', 'Pending'],
    default: 'Active'
  },
  assignedGuards: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Guard'
  }],
  services: [{
    type: String,
    required: true
  }],
  notes: { 
    type: String 
  }
}, { 
  timestamps: true 
});

// Indexes for better query performance
ClientSchema.index({ name: 1 });
ClientSchema.index({ email: 1 }, { unique: true });
ClientSchema.index({ status: 1 });

const Client = (mongoose.models.Client as Model<IClient>) || mongoose.model<IClient>('Client', ClientSchema);

export default Client; 