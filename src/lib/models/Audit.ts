import mongoose, { Document, Model } from 'mongoose';

export interface IAudit extends Document {
  title: string;
  type: 'Security' | 'Safety' | 'Compliance' | 'Equipment';
  client: mongoose.Types.ObjectId;
  location: string;
  auditor: mongoose.Types.ObjectId;
  date: Date;
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
  checklist: Array<{
    category: string;
    items: Array<{
      item: string;
      status: 'Pass' | 'Fail' | 'N/A';
      notes?: string;
    }>;
  }>;
  findings: Array<{
    description: string;
    severity: 'Low' | 'Medium' | 'High';
    recommendation: string;
    dueDate?: Date;
    status: 'Open' | 'In Progress' | 'Resolved';
  }>;
  summary: {
    totalItems: number;
    passedItems: number;
    failedItems: number;
    score: number;
    notes: string;
  };
  attachments?: Array<{
    name: string;
    url: string;
    type: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const AuditSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true 
  },
  type: { 
    type: String, 
    enum: ['Security', 'Safety', 'Compliance', 'Equipment'],
    required: true 
  },
  client: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Client',
    required: true 
  },
  location: { 
    type: String, 
    required: true 
  },
  auditor: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  date: { 
    type: Date, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['Scheduled', 'In Progress', 'Completed', 'Cancelled'],
    default: 'Scheduled'
  },
  checklist: [{
    category: { 
      type: String, 
      required: true 
    },
    items: [{
      item: { 
        type: String, 
        required: true 
      },
      status: { 
        type: String,
        enum: ['Pass', 'Fail', 'N/A'],
        required: true 
      },
      notes: { 
        type: String 
      }
    }]
  }],
  findings: [{
    description: { 
      type: String, 
      required: true 
    },
    severity: { 
      type: String,
      enum: ['Low', 'Medium', 'High'],
      required: true 
    },
    recommendation: { 
      type: String, 
      required: true 
    },
    dueDate: { 
      type: Date 
    },
    status: { 
      type: String,
      enum: ['Open', 'In Progress', 'Resolved'],
      default: 'Open'
    }
  }],
  summary: {
    totalItems: { 
      type: Number, 
      required: true 
    },
    passedItems: { 
      type: Number, 
      required: true 
    },
    failedItems: { 
      type: Number, 
      required: true 
    },
    score: { 
      type: Number, 
      required: true 
    },
    notes: { 
      type: String, 
      required: true 
    }
  },
  attachments: [{
    name: { 
      type: String, 
      required: true 
    },
    url: { 
      type: String, 
      required: true 
    },
    type: { 
      type: String, 
      required: true 
    }
  }]
}, { 
  timestamps: true 
});

// Indexes for better query performance
AuditSchema.index({ title: 1 });
AuditSchema.index({ type: 1 });
AuditSchema.index({ client: 1 });
AuditSchema.index({ auditor: 1 });
AuditSchema.index({ date: -1 });
AuditSchema.index({ status: 1 });
AuditSchema.index({ 'findings.severity': 1 });
AuditSchema.index({ 'findings.status': 1 });

const Audit = (mongoose.models.Audit as Model<IAudit>) || mongoose.model<IAudit>('Audit', AuditSchema);

export default Audit; 