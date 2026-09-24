import { Schema, model, Document, Types } from 'mongoose';

export interface IComment extends Document {
  ticket: Types.ObjectId;
  author: Types.ObjectId;
  message: string;
}

const commentSchema = new Schema<IComment>({
  ticket: { type: Schema.Types.ObjectId, ref: 'Ticket', required: true },
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
}, { timestamps: true });

export const Comment = model<IComment>('Comment', commentSchema);