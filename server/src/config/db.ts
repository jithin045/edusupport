import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    
    if (!mongoUri) {
      throw new Error('Fatal Error: MONGO_URI environment variable is not defined in the .env file.');
    }

    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error: unknown) {
    const err = error as Error;
    console.error(`Database Connection Error: ${err.message}`);
    process.exit(1);
  }
};

export default connectDB;