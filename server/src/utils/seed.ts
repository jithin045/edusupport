import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import connectDB from '../config/db';

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();

    await User.deleteMany({});

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    await User.create([
      {
        name: 'Rahul',
        email: 'student@edusupport.com',
        password: hashedPassword,
        role: 'STUDENT',
      },
      {
        name: 'Priya',
        email: 'staff@edusupport.com',
        password: hashedPassword,
        role: 'STAFF',
        department: 'Academics',
      },
      {
        name: 'Amit',
        email: 'manager@edusupport.com',
        password: hashedPassword,
        role: 'MANAGER',
        department: 'Administration',
      },
    ]);

    console.log('Database Seeded Successfully! Test accounts created.');
    console.log('Login with: student@edusupport.com / staff@edusupport.com / manager@edusupport.com (Password: password123)');
    process.exit();
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();