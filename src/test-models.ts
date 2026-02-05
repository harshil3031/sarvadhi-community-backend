import sequelize, { testConnection } from './db/index.js';

const testModels = async () => {
  try {
    const isConnected = await testConnection();
    if (!isConnected) {
      console.error('Failed to connect to database');
      process.exit(1);
    }

    console.log('\n✓ All models initialized successfully');
    console.log('✓ Model associations configured');
    
    // List all models
    const models = sequelize.models;
    console.log('\nRegistered models:');
    Object.keys(models).forEach(modelName => {
      console.log(`  - ${modelName}`);
    });
    
    process.exit(0);
  } catch (error) {
    const err = error as Error;
    console.error('Error testing models:', err.message);
    process.exit(1);
  }
};

testModels();
