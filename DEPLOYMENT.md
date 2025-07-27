# ReCircle Deployment Guide

## 🚀 Deployment Overview

ReCircle is designed for seamless deployment on Replit with automatic scaling capabilities. This guide covers both development and production deployment scenarios.

## 📋 Prerequisites

### Required Accounts & Services
- **Replit Account**: For hosting and deployment
- **VeWorld Wallet**: For blockchain interactions
- **OpenAI Account**: For receipt validation API
- **Google Account**: For Forms integration (optional)
- **PostgreSQL Database**: Provided by Replit

### Required API Keys
```env
OPENAI_API_KEY=sk-...                    # Required for receipt validation
GOOGLE_SHEETS_WEBHOOK_URL=https://...    # Optional for manual review
```

## 🛠️ Development Deployment

### Local Development Setup
```bash
# Clone repository
git clone https://github.com/your-username/recircle.git
cd recircle

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your values

# Setup database
npm run db:push

# Start development server
npm run dev
```

### Development Environment Variables
```env
NODE_ENV=development
DATABASE_URL=postgresql://localhost:5432/recircle_dev
OPENAI_API_KEY=your_openai_api_key
VECHAIN_NETWORK=testnet
REWARD_DISTRIBUTOR_WALLET=0x15D009B3A5811fdE66F19b2db1D40172d53E5653
APP_FUND_WALLET=0x119761865b79bea9e7924edaa630942322ca09d1
```

## 🌐 Production Deployment (Replit)

### Step 1: Import to Replit
1. Go to [Replit](https://replit.com)
2. Click "Create Repl"
3. Choose "Import from GitHub"
4. Enter repository URL
5. Click "Import from GitHub"

### Step 2: Configure Environment Variables
Navigate to Replit's "Secrets" tab and add:

```env
# Core Configuration
NODE_ENV=production
PORT=5000

# Database (automatically provided by Replit)
DATABASE_URL=postgresql://...

# Blockchain Configuration
VECHAIN_NETWORK=mainnet
REWARD_DISTRIBUTOR_WALLET=0x15D009B3A5811fdE66F19b2db1D40172d53E5653
APP_FUND_WALLET=0x119761865b79bea9e7924edaa630942322ca09d1

# External Services
OPENAI_API_KEY=sk-your-openai-api-key

# Optional: Google Sheets Integration
GOOGLE_SHEETS_WEBHOOK_URL=https://script.google.com/...

# Security
SESSION_SECRET=your-secure-random-string
CORS_ORIGIN=https://your-repl-url.replit.app
```

### Step 3: Install Dependencies
```bash
npm install
```

### Step 4: Setup Database
```bash
npm run db:push
```

### Step 5: Deploy
1. Click the "Deploy" button in Replit
2. Choose "Autoscale Deployment"
3. Configure deployment settings:
   - **CPU**: 4 vCPU
   - **Memory**: 8 GiB RAM
   - **Max Instances**: 3
4. Click "Deploy"

## 🔧 Deployment Configuration

### Replit Configuration (.replit)
```toml
[deployment]
run = ["npm", "run", "start"]
deploymentTarget = "autoscale"

[languages.typescript]
pattern = "**/{*.ts,*.js,*.tsx,*.jsx}"

[languages.typescript.languageServer]
start = "typescript-language-server --stdio"

[env]
PATH = "/home/runner/$REPL_SLUG/.config/npm/node_global/bin:/home/runner/$REPL_SLUG/node_modules/.bin"
npm_config_prefix = "/home/runner/$REPL_SLUG/.config/npm/node_global"
```

### Package.json Scripts
```json
{
  "scripts": {
    "dev": "NODE_ENV=development tsx server/index.ts",
    "start": "NODE_ENV=production tsx server/index.ts",
    "build": "vite build",
    "preview": "vite preview",
    "db:push": "drizzle-kit push:pg",
    "db:studio": "drizzle-kit studio"
  }
}
```

## 🗄️ Database Configuration

### PostgreSQL Setup (Automatic)
Replit provides PostgreSQL automatically. The DATABASE_URL is set in environment variables.

### Database Migrations
```bash
# Push schema changes to database
npm run db:push

# Open database studio (development)
npm run db:studio
```

### Connection Pooling
```typescript
// Automatic connection pooling for production
const db = drizzle(new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // Maximum connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
}));
```

## 🔐 Security Configuration

### HTTPS Setup
- **Automatic**: Replit provides HTTPS automatically
- **Custom Domain**: Configure in Replit deployment settings
- **SSL Certificate**: Managed by Replit

### CORS Configuration
```typescript
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### Rate Limiting
```typescript
// Production rate limiting
const rateLimits = {
  receipt_submission: { windowMs: 60000, max: 5 },
  general_api: { windowMs: 60000, max: 100 },
  auth_endpoints: { windowMs: 900000, max: 5 }
};
```

## 📊 Monitoring & Health Checks

### Health Check Endpoint
```typescript
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});
```

### Performance Monitoring
```typescript
// Memory usage monitoring
const memoryUsage = process.memoryUsage();
console.log('Memory Usage:', {
  rss: Math.round(memoryUsage.rss / 1024 / 1024) + ' MB',
  heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024) + ' MB',
  heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + ' MB'
});
```

## 🔧 Troubleshooting

### Common Issues

#### Build Failures
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check Node.js version
node --version  # Should be 18+
```

#### Database Connection Issues
```bash
# Verify DATABASE_URL is set
echo $DATABASE_URL

# Test database connection
npm run db:push
```

#### VeChain Connection Issues
```typescript
// Verify VeChain network configuration
console.log('VeChain Network:', process.env.VECHAIN_NETWORK);
console.log('Reward Distributor:', process.env.REWARD_DISTRIBUTOR_WALLET);
```

#### OpenAI API Issues
```bash
# Test OpenAI connection
curl -H "Authorization: Bearer $OPENAI_API_KEY" \
  https://api.openai.com/v1/models
```

### Performance Optimization

#### Memory Management
```typescript
// Garbage collection optimization
if (global.gc) {
  setInterval(() => {
    global.gc();
  }, 30000);
}
```

#### Database Query Optimization
```typescript
// Use proper indexing
await db.select()
  .from(transactions)
  .where(eq(transactions.userId, userId))
  .orderBy(desc(transactions.createdAt))
  .limit(50);
```

## 📈 Scaling Considerations

### Horizontal Scaling
- **Auto-scaling**: Replit handles automatically based on traffic
- **Load Balancing**: Automatic request distribution
- **Health Checks**: Automatic instance health monitoring

### Database Scaling
- **Connection Pooling**: 20 connections per instance
- **Query Optimization**: Indexed queries for performance
- **Read Replicas**: Consider for high-traffic scenarios

### Cache Strategy
```typescript
// In-memory caching for frequently accessed data
const cache = new Map();

const getCachedUser = (userId: string) => {
  if (cache.has(userId)) {
    return cache.get(userId);
  }
  
  const user = getUserFromDatabase(userId);
  cache.set(userId, user);
  return user;
};
```

## 🚀 Deployment Checklist

### Pre-Deployment
- [ ] Environment variables configured
- [ ] Database schema updated
- [ ] API keys tested and valid
- [ ] Build process successful
- [ ] Tests passing

### Post-Deployment
- [ ] Health check endpoint responding
- [ ] Database connections working
- [ ] VeChain integration functional
- [ ] OpenAI API responding
- [ ] User registration/login working
- [ ] Receipt submission working
- [ ] Reward distribution working

### Monitoring Setup
- [ ] Error logging configured
- [ ] Performance metrics tracked
- [ ] Uptime monitoring enabled
- [ ] Database performance monitored

## 📞 Support & Maintenance

### Regular Maintenance
- **Weekly**: Review error logs and performance metrics
- **Monthly**: Update dependencies and security patches
- **Quarterly**: Review and optimize database performance

### Emergency Response
1. **Check Health Endpoint**: Verify application is responding
2. **Review Logs**: Check for error patterns
3. **Database Status**: Verify database connectivity
4. **External Services**: Test OpenAI and VeChain connections
5. **Rollback Plan**: Deploy previous stable version if needed

### Backup Strategy
- **Database**: Automatic daily backups by Replit
- **Environment**: Backup of environment variables
- **Code**: Git repository serves as code backup

---

This deployment guide ensures ReCircle can be deployed reliably with proper monitoring, security, and scalability considerations for a professional transportation rewards platform.