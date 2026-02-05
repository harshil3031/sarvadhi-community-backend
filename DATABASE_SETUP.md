# Database Configuration

## Sequelize Setup Complete ✅

### Configuration Options

The backend supports two methods for database configuration:

#### 1. DATABASE_URL (Recommended)
Single connection string format:
```env
DATABASE_URL=postgresql://username:password@host:port/database
```

**Advantages:**
- Single variable for all connection info
- Easy to use with cloud providers (Heroku, Railway, etc.)
- Better for production deployments
- Supports SSL automatically in production

#### 2. Individual Fields (Fallback)
Separate environment variables:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sarvadhi_community
DB_USER=postgres
DB_PASSWORD=your_password
```

**Priority:** If `DATABASE_URL` is set, it takes precedence over individual fields.

### Connection Features

✅ **Automatic SSL in Production**: SSL is enabled automatically when `NODE_ENV=production`  
✅ **Connection Pooling**: Configured with sensible defaults (max: 5, min: 0)  
✅ **Logging**: SQL queries logged only in development mode  
✅ **Error Handling**: Helpful error messages for common issues  
✅ **Connection Testing**: Automatic connection test on server startup  

### Connection Pool Settings

```typescript
pool: {
  max: 5,       // Maximum number of connections
  min: 0,       // Minimum number of connections
  acquire: 30000, // Maximum time (ms) to get connection
  idle: 10000    // Maximum time (ms) connection can be idle
}
```

### Error Messages

The system provides helpful error messages:

- **Password errors**: "Check your database credentials"
- **Connection refused**: "Make sure PostgreSQL is running"
- **Database not found**: "Create it with: createdb database_name"

### Testing Connection

The database connection is tested automatically when the server starts:

```bash
npm run dev
```

Expected output:
```
✓ Database connection established successfully
  Using DATABASE_URL connection
  Connected to: localhost:5432/sarvadhi_community
```

### Files Modified

- ✅ `src/config/index.ts` - Added DATABASE_URL support
- ✅ `src/db/index.ts` - Updated Sequelize initialization
- ✅ `.env.example` - Added DATABASE_URL documentation
- ✅ `README.md` - Updated configuration instructions

### Next Steps

1. ✅ Database connection configured
2. ⏳ Create Sequelize models (based on docs/sarvadhi_api_db_spec.md)
3. ⏳ Create database migrations
4. ⏳ Implement business logic

---

**Status**: 🟢 Database ready for model creation
