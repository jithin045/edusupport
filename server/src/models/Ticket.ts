import { Schema, model, Document, Types } from 'mongoose';

export interface ITicket extends Document {
  ticketNumber: string;
  student: Types.ObjectId;
  subject: string;
  description: string;
  category: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'PENDING' | 'RESOLVED' | 'CLOSED';
  assignedTo?: Types.ObjectId;
  dueAt: Date;
}

const ticketSchema = new Schema<ITicket>({
  ticketNumber: { type: String, required: true, unique: true },
  student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  priority: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' },
  status: { 
    type: String, 
    enum: ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'PENDING', 'RESOLVED', 'CLOSED'], 
    default: 'OPEN' 
  },
  assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
  dueAt: { type: Date, required: true },
}, { timestamps: true });

export const Ticket = model<ITicket>('Ticket', ticketSchema);