import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: 'STUDENT' | 'STAFF' | 'MANAGER';
  department?: string;
}

const userSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['STUDENT', 'STAFF', 'MANAGER'], default: 'STUDENT' },
  department: { type: String },
}, { timestamps: true });

export const User = model<IUser>('User', userSchema);