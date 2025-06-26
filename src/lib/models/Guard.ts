import mongoose, { Document, Model } from 'mongoose';

export interface IGuard extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  address: string;
  nationalId: string;
  licenseNumber: string;
  licenseExpiry: Date;
  status: 'Active' | 'Inactive' | 'On Leave';
  currentAssignment?: {
    clientId: mongoose.Types.ObjectId;
    startDate: Date;
    endDate?: Date;
    shift: 'Day' | 'Night' | 'Rotating';
  };
  certifications: Array<{
    name: string;
    issuedDate: Date;
    expiryDate: Date;
  }>;
  incidents?: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const GuardSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  name: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
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
  nationalId: { 
    type: String, 
    required: true, 
    unique: true 
  },
  licenseNumber: { 
    type: String, 
    required: true, 
    unique: true 
  },
  licenseExpiry: { 
    type: Date, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['Active', 'Inactive', 'On Leave'],
    default: 'Active'
  },
  currentAssignment: {
    clientId: { 
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client'
    },
    startDate: { type: Date },
    endDate: { type: Date },
    shift: { 
      type: String,
      enum: ['Day', 'Night', 'Rotating']
    }
  },
  certifications: [{
    name: { type: String, required: true },
    issuedDate: { type: Date, required: true },
    expiryDate: { type: Date, required: true }
  }],
  incidents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Incident'
  }]
}, { 
  timestamps: true 
});

// Indexes for better query performance
GuardSchema.index({ name: 1 });
GuardSchema.index({ email: 1 }, { unique: true });
GuardSchema.index({ nationalId: 1 }, { unique: true });
GuardSchema.index({ licenseNumber: 1 }, { unique: true });
GuardSchema.index({ status: 1 });
GuardSchema.index({ 'currentAssignment.clientId': 1 });

const Guard = (mongoose.models.Guard as Model<IGuard>) || mongoose.model<IGuard>('Guard', GuardSchema);

export default Guard; 