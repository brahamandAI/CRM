require('dotenv').config();
const dbConnect = require('../src/lib/db').default;

async function testConnection() {
  try {
    console.log('Attempting to connect to MongoDB...');
    console.log('Using URI:', process.env.MONGODB_URI);
    const connection = await dbConnect();
    console.log('Successfully connected to MongoDB!');
    console.log('Connection details:', {
      host: connection.connection.host,
      port: connection.connection.port,
      name: connection.connection.name
    });
    process.exit(0);
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
}

testConnection(); 