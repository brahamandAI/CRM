import mongoose, { Document, Model } from 'mongoose';

export interface IIncident extends Document {
  title: string;
  type: string;
  description: string;
  location: string;
  date: Date;
  time: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  client: mongoose.Types.ObjectId;
  guard: mongoose.Types.ObjectId;
  reportedBy: mongoose.Types.ObjectId;
  actionTaken: string;
  evidence?: Array<{
    type: 'Photo' | 'Document';
    url: string;
  }>;
  witnesses?: Array<{
    name: string;
    contact: string;
    statement: string;
  }>;
  resolution?: {
    resolvedBy: mongoose.Types.ObjectId;
    resolvedAt: Date;
    notes: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const IncidentSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true 
  },
  type: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  location: { 
    type: String, 
    required: true 
  },
  date: { 
    type: Date, 
    required: true 
  },
  time: { 
    type: String, 
    required: true 
  },
  severity: { 
    type: String, 
    enum: ['Low', 'Medium', 'High', 'Critical'],
    required: true 
  },
  status: { 
    type: String, 
    enum: ['Open', 'In Progress', 'Resolved', 'Closed'],
    default: 'Open'
  },
  client: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Client',
    required: true 
  },
  guard: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Guard',
    required: true 
  },
  reportedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  actionTaken: { 
    type: String, 
    required: true 
  },
  evidence: [{
    type: { 
      type: String,
      enum: ['Photo', 'Document'],
      required: true 
    },
    url: { type: String, required: true }
  }],
  witnesses: [{
    name: { type: String, required: true },
    contact: { type: String, required: true },
    statement: { type: String, required: true }
  }],
  resolution: {
    resolvedBy: { 
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    resolvedAt: { type: Date },
    notes: { type: String }
  }
}, { 
  timestamps: true 
});

// Indexes for better query performance
IncidentSchema.index({ title: 1 });
IncidentSchema.index({ type: 1 });
IncidentSchema.index({ date: -1 });
IncidentSchema.index({ severity: 1 });
IncidentSchema.index({ status: 1 });
IncidentSchema.index({ client: 1 });
IncidentSchema.index({ guard: 1 });

const Incident = (mongoose.models.Incident as Model<IIncident>) || mongoose.model<IIncident>('Incident', IncidentSchema);

export default Incident; 