import { Schema, model, Document, Types } from 'mongoose';

export interface IActivity extends Document {
  ticket: Types.ObjectId;
  actor: Types.ObjectId;
  action: string;
  oldValue?: string;
  newValue?: string;
}

const activitySchema = new Schema<IActivity>({
  ticket: { type: Schema.Types.ObjectId, ref: 'Ticket', required: true },
  actor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true },
  oldValue: { type: String },
  newValue: { type: String },
}, { timestamps: true });

export const Activity = model<IActivity>('Activity', activitySchema);