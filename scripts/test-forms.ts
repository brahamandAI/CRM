require('dotenv').config();
const connectDB = require('../src/lib/db').default;
const AlertModel = require('../src/lib/models/Alert').default;
const ClientModel = require('../src/lib/models/Client').default;
const GuardModel = require('../src/lib/models/Guard').default;
const IncidentModel = require('../src/lib/models/Incident').default;
const AuditModel = require('../src/lib/models/Audit').default;
const TrainingModel = require('../src/lib/models/Training').default;

async function testFormSubmissions() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await connectDB();
    console.log('Successfully connected to MongoDB Atlas!');

    // Test Client Creation
    console.log('\nTesting Client Creation...');
    const timestamp = Date.now();
    const testClient = await ClientModel.create({
      name: 'Test Company',
      address: '123 Test St',
      contactPerson: 'John Doe',
      contactEmail: `test${timestamp}@example.com`,
      contactPhone: '1234567890',
      contractStart: new Date(),
      contractEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      status: 'Active'
    });
    console.log('✅ Client created successfully:', testClient._id);

    // Test Guard Creation
    console.log('\nTesting Guard Creation...');
    const testGuard = await GuardModel.create({
      name: 'Test Guard',
      email: `guard${Date.now()}@test.com`,
      phone: '0987654321',
      licenseNumber: 'LIC123',
      status: 'Active',
      assignedClient: testClient._id
    });
    console.log('✅ Guard created successfully:', testGuard._id);

    // Test Alert Creation
    console.log('\nTesting Alert Creation...');
    const testAlert = await AlertModel.create({
      title: 'Test Alert',
      description: 'Test Description',
      type: 'Security',
      priority: 'High',
      status: 'Active',
      location: 'Test Location',
      client: testClient._id,
      guard: testGuard._id,
      reportedBy: 'Test User',
      notificationSettings: {
        email: true,
        sms: false,
        recipients: ['test@example.com']
      }
    });
    console.log('✅ Alert created successfully:', testAlert._id);

    // Test Incident Creation
    console.log('\nTesting Incident Creation...');
    const testIncident = await IncidentModel.create({
      title: 'Test Incident',
      type: 'Security',
      description: 'Test Description',
      severity: 'High',
      status: 'Active',
      date: new Date(),
      location: 'Test Location',
      client: testClient._id,
      guard: testGuard._id,
      reportedBy: testClient._id  // Using client ID as a temporary user ID
    });
    console.log('✅ Incident created successfully:', testIncident._id);

    // Test Audit Creation
    console.log('\nTesting Audit Creation...');
    const testAudit = await AuditModel.create({
      client: testClient._id,
      date: new Date(),
      conductedBy: testClient._id, // Using client ID as a temporary user ID
      score: 85,
      remarks: 'Test audit remarks',
      status: 'Pending',
      checklist: [{
        item: 'Test checklist item',
        status: 'Pass',
        comments: 'Test comment'
      }]
    });
    console.log('✅ Audit created successfully:', testAudit._id);

    // Test Training Creation
    console.log('\nTesting Training Creation...');
    const testTraining = await TrainingModel.create({
      guard: testGuard._id,
      certification: 'Security License',
      dateCompleted: new Date(),
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      status: 'Valid',
      notes: 'Test training notes'
    });
    console.log('✅ Training created successfully:', testTraining._id);

    // Clean up test data
    console.log('\nCleaning up test data...');
    await Promise.all([
      ClientModel.findByIdAndDelete(testClient._id),
      GuardModel.findByIdAndDelete(testGuard._id),
      AlertModel.findByIdAndDelete(testAlert._id),
      IncidentModel.findByIdAndDelete(testIncident._id),
      AuditModel.findByIdAndDelete(testAudit._id),
      TrainingModel.findByIdAndDelete(testTraining._id)
    ]);
    console.log('✅ Test data cleaned up successfully');

    console.log('\n✅ All form submissions tested successfully!');
  } catch (error) {
    console.error('❌ Error during testing:', error);
  } finally {
    // Close the database connection
    const connection = await connectDB();
    await connection.connection.close();
    console.log('\nDatabase connection closed');
    process.exit(0);
  }
}

testFormSubmissions(); 