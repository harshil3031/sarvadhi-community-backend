import { Sequelize } from 'sequelize';
import config from '../config/index.js';
import { initializeModels } from './models/index.js';

// Initialize Sequelize with DATABASE_URL or individual connection parameters
const sequelize = config.database.url
  ? new Sequelize(config.database.url, {
      dialect: config.database.dialect,
      logging: config.database.logging,
      pool: config.database.pool,
      dialectOptions: {
        ssl: process.env.NODE_ENV === 'production' ? {
          require: true,
          rejectUnauthorized: false
        } : false
      }
    })
  : new Sequelize(
      config.database.name!,
      config.database.user!,
      config.database.password!,
      {
        host: config.database.host,
        port: config.database.port,
        dialect: config.database.dialect,
        logging: config.database.logging,
        pool: config.database.pool
      }
    );

// Initialize all models and associations
initializeModels(sequelize);

export const testConnection = async (): Promise<boolean> => {
  try {
    await sequelize.authenticate();
    console.log('✓ Database connection established successfully');
    
    // Log connection info (without sensitive data)
    if (config.env === 'development') {
      if (config.database.url) {
        console.log('  Using DATABASE_URL connection');
      } else {
        console.log(`  Connected to: ${config.database.host}:${config.database.port}/${config.database.name}`);
      }
    }
    
    return true;
  } catch (error) {
    const err = error as Error;
    console.error('✗ Unable to connect to the database:', err.message);
    
    // Provide helpful error messages
    if (err.message.includes('password')) {
      console.error('  → Check your database credentials');
    } else if (err.message.includes('ECONNREFUSED')) {
      console.error('  → Make sure PostgreSQL is running');
    } else if (err.message.includes('database') && err.message.includes('does not exist')) {
      console.error('  → Database does not exist. Create it with: createdb ' + config.database.name);
    }
    
    return false;
  }
};

export default sequelize;
