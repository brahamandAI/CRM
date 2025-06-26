import mongoose, { Document, Model } from 'mongoose';

export interface ITraining extends Document {
  title: string;
  description: string;
  type: 'Initial' | 'Refresher' | 'Specialized' | 'Compliance';
  instructor: mongoose.Types.ObjectId;
  startDate: Date;
  endDate: Date;
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
  location: {
    type: 'Online' | 'In-Person';
    venue?: string;
    address?: string;
    meetingLink?: string;
  };
  participants: Array<{
    guard: mongoose.Types.ObjectId;
    status: 'Registered' | 'Attended' | 'Completed' | 'Failed' | 'No Show';
    registrationDate: Date;
    attendance?: Array<{
      date: Date;
      status: 'Present' | 'Absent' | 'Late';
    }>;
    assessment?: {
      score: number;
      completionDate: Date;
      certificate?: string;
    };
  }>;
  materials: Array<{
    title: string;
    type: 'Document' | 'Video' | 'Presentation';
    url: string;
  }>;
  assessment: {
    passingScore: number;
    questions: Array<{
      question: string;
      type: 'Multiple Choice' | 'True/False';
      options: string[];
      correctAnswer: string;
    }>;
  };
  createdAt: Date;
  updatedAt: Date;
}

const TrainingSchema = new mongoose.Schema({
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
    enum: ['Initial', 'Refresher', 'Specialized', 'Compliance'],
    required: true 
  },
  instructor: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true 
  },
  startDate: { 
    type: Date, 
    required: true 
  },
  endDate: { 
    type: Date, 
    required: true 
  },
  status: { 
    type: String,
    enum: ['Scheduled', 'In Progress', 'Completed', 'Cancelled'],
    default: 'Scheduled'
  },
  location: {
    type: { 
      type: String,
      enum: ['Online', 'In-Person'],
      required: true 
    },
    venue: { type: String },
    address: { type: String },
    meetingLink: { type: String }
  },
  participants: [{
    guard: { 
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Guard',
      required: true 
    },
    status: { 
      type: String,
      enum: ['Registered', 'Attended', 'Completed', 'Failed', 'No Show'],
      default: 'Registered'
    },
    registrationDate: { 
      type: Date, 
      default: Date.now 
    },
    attendance: [{
      date: { type: Date, required: true },
      status: { 
        type: String,
        enum: ['Present', 'Absent', 'Late'],
        required: true 
      }
    }],
    assessment: {
      score: { type: Number },
      completionDate: { type: Date },
      certificate: { type: String }
    }
  }],
  materials: [{
    title: { 
      type: String, 
      required: true 
    },
    type: { 
      type: String,
      enum: ['Document', 'Video', 'Presentation'],
      required: true 
    },
    url: { 
      type: String, 
      required: true 
    }
  }],
  assessment: {
    passingScore: { 
      type: Number, 
      required: true 
    },
    questions: [{
      question: { 
        type: String, 
        required: true 
      },
      type: { 
        type: String,
        enum: ['Multiple Choice', 'True/False'],
        required: true 
      },
      options: [{ 
        type: String, 
        required: true 
      }],
      correctAnswer: { 
        type: String, 
        required: true 
      }
    }]
  }
}, { 
  timestamps: true 
});

// Indexes for better query performance
TrainingSchema.index({ title: 1 });
TrainingSchema.index({ type: 1 });
TrainingSchema.index({ instructor: 1 });
TrainingSchema.index({ startDate: -1 });
TrainingSchema.index({ status: 1 });
TrainingSchema.index({ 'participants.guard': 1 });
TrainingSchema.index({ 'participants.status': 1 });

const Training = (mongoose.models.Training as Model<ITraining>) || mongoose.model<ITraining>('Training', TrainingSchema);

export default Training; 