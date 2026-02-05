# Quick Setup Guide

## Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

## Setup Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Database Setup
```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE sarvadhi_community;

# Exit psql
\q
```

### 3. Environment Configuration
```bash
# Copy the example env file
cp .env.example .env

# Edit .env with your actual values
# Required: DB_PASSWORD, JWT_SECRET
```

### 4. Start Development Server
```bash
npm run dev
```

### 5. Build for Production
```bash
npm run build
npm start
```

### 6. Test the Server
Open browser or use curl:
```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2026-02-04T..."
}
```

## What's Included

✅ TypeScript with strict type checking  
✅ Express.js server with ES Modules  
✅ PostgreSQL connection via Sequelize  
✅ JWT authentication middleware (structure ready)  
✅ Centralized error handling  
✅ All API routes defined per specification  
✅ Security middleware (Helmet, CORS, Rate Limiting)  
✅ Request logging (Morgan in dev mode)  
✅ Clean folder structure  
✅ Type-safe Request/Response handling  

## What's NOT Included (As Requested)

❌ Sequelize models (will be created separately)  
❌ Business logic implementation  
❌ Authentication implementation  
❌ Unnecessary libraries  

## Next Development Phase

1. Create Sequelize models based on `docs/sarvadhi_api_db_spec.md`
2. Implement controller logic with proper types
3. Implement service layer with proper types
4. Add input validation with type guards
5. Create database migrations

## Troubleshooting

**TypeScript compilation errors:**
- Run `npm run build` to check for type errors
- Ensure all dependencies have @types packages installed

**Database connection failed:**
- Verify PostgreSQL is running: `pg_isready`
- Check credentials in `.env`
- Ensure database exists: `psql -l`

**Port already in use:**
- Change `PORT` in `.env`
- Kill process: `lsof -ti:3000 | xargs kill -9`

**Module not found errors:**
- Ensure `"type": "module"` is in package.json
- Check all imports use `.js` extension (TypeScript requirement for ES modules)
- Run `npm install` to ensure all dependencies are installed
