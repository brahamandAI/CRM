require('dotenv').config();
const mongoose = require('mongoose');

interface MongoError extends Error {
  code?: number;
}

async function dropCollection(db: any, collectionName: string) {
  try {
    await db.dropCollection(collectionName);
    console.log(`Dropped ${collectionName} collection`);
  } catch (error: unknown) {
    if ((error as MongoError).code === 26) {
      console.log(`Collection ${collectionName} does not exist, which is fine`);
    } else {
      console.error(`❌ Error dropping ${collectionName} collection:`, error);
    }
  }
}

async function fixDatabaseSchema() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Successfully connected to MongoDB Atlas!');

    const collections = ['clients', 'guards', 'alerts', 'incidents', 'audits', 'trainings'];
    
    // Drop all collections to remove old indexes
    for (const collection of collections) {
      await dropCollection(mongoose.connection.db, collection);
    }

    // The collections will be recreated with the correct schema when we run our tests
    console.log('✅ Database schema fixed successfully!');
  } catch (error) {
    console.error('❌ Error fixing database schema:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
    process.exit(0);
  }
}

fixDatabaseSchema(); 