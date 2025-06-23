import mongoose, { Document, Model } from 'mongoose';

export interface ITraining extends Document {
  guard: mongoose.Types.ObjectId;
  certification: string;
  dateCompleted: Date;
  expiryDate: Date;
  status: 'Valid' | 'Expired';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TrainingSchema = new mongoose.Schema({
  guard: { type: mongoose.Schema.Types.ObjectId, ref: 'Guard', required: true },
  certification: { type: String, required: true },
  dateCompleted: { type: Date, required: true },
  expiryDate: { type: Date, required: true },
  status: { type: String, enum: ['Valid', 'Expired'], default: 'Valid' },
  notes: { type: String },
}, { timestamps: true });

// Delete the model if it exists to prevent OverwriteModelError
const Training = (mongoose.models.Training as Model<ITraining>) || mongoose.model<ITraining>('Training', TrainingSchema);

export default Training; 