import dbConnect from '../src/lib/db';

async function testConnection() {
  try {
    console.log('Testing database connection...');
    const mongoose = await dbConnect();
    console.log('Database connected successfully!');
    
    // Get list of collections
    const collections = await mongoose.connection.db.collections();
    console.log('\nAvailable collections:');
    for (let collection of collections) {
      console.log(`- ${collection.collectionName}`);
    }

    // Test a simple query
    const usersCount = await mongoose.connection.db.collection('users').countDocuments();
    console.log(`\nNumber of users in database: ${usersCount}`);

    process.exit(0);
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
}

testConnection(); 