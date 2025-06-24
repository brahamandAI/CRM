import dbConnect from '../db';
import mongoose from 'mongoose';

describe('Database Connection', () => {
  beforeAll(async () => {
    // Ensure we're not actually connecting to the production database
    process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/test';
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('should connect to MongoDB successfully', async () => {
    const connection = await dbConnect();
    expect(connection).toBeDefined();
    expect(mongoose.connection.readyState).toBe(1); // 1 means connected
  });
}); 