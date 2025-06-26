require('dotenv').config();
const dbConnect = require('../src/lib/db').default;
const Client = require('../src/lib/models/Client').default;
const mongoose = require('mongoose');

async function testDatabaseConnection() {
  try {
    // Connect to the database
    console.log('Connecting to MongoDB Atlas...');
    await dbConnect();
    console.log('Successfully connected to MongoDB Atlas!');

    // Create a test client
    const testClient = await Client.create({
      name: 'Test Company',
      contact: 'John Doe',
      email: 'test@example.com',
      phone: '1234567890',
      address: '123 Test Street, Test City',
      contractStartDate: new Date(),
      contractEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      status: 'Active',
      services: ['Security Guard', 'Surveillance']
    });

    console.log('Successfully created test client:', testClient);

    // Retrieve the client we just created
    const retrievedClient = await Client.findById(testClient._id);
    console.log('Successfully retrieved client from database:', retrievedClient);

    // Clean up - delete the test client
    await Client.findByIdAndDelete(testClient._id);
    console.log('Successfully deleted test client');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Close the connection
    const connection = await dbConnect();
    await connection.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  }
}

testDatabaseConnection(); 