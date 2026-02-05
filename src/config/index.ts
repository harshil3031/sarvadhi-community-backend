import dotenv from 'dotenv';

dotenv.config();

interface DatabaseConfig {
  url?: string;
  host?: string;
  port?: number;
  name?: string;
  user?: string;
  password?: string;
  dialect: 'postgres';
  logging: boolean | ((sql: string) => void);
  pool: {
    max: number;
    min: number;
    acquire: number;
    idle: number;
  };
}

interface CorsConfig {
  allowedOrigins: string[];
}

interface JwtConfig {
  secret: string;
  expiresIn: string;
}

interface Config {
  env: string;
  port: number;
  database: DatabaseConfig;
  jwt: JwtConfig;
  cors: CorsConfig;
}

const config: Config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  
  database: {
    // Prefer DATABASE_URL if provided, otherwise use individual fields
    url: process.env.DATABASE_URL,
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    name: process.env.DB_NAME || 'sarvadhi_community',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'change_this_secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },
  
  cors: {
    allowedOrigins: process.env.ALLOWED_ORIGINS 
      ? process.env.ALLOWED_ORIGINS.split(',')
      : ['http://localhost:19006']
  }
};

export default config;
