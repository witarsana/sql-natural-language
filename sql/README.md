# Chronicle Natural Language Query System

A production-ready internal application for Chronicle Cemetery Management Software that translates natural language questions into MySQL queries using AI.

## 🎯 Overview

This system allows non-technical staff to query cemetery data using plain English. The AI (Claude) generates safe, validated SQL queries that are executed against your Chronicle database.

**Example queries:**

- "Show me all available plots in section A"
- "Which plots are currently occupied?"
- "List all deceased persons buried in 2024"
- "How many family plots are available?"

## 🏗️ Architecture

```
┌─────────────────┐
│  Angular UI     │  ← User types natural language
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Fastify API    │  ← Validates request
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  AI Service     │  ← Claude generates SQL
│  (Claude 3.5)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Validation     │  ← 5-layer security check
│  Service        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  MySQL          │  ← Safe query execution
│  (Chronicle DB) │
└─────────────────┘
```

## 🔐 Security Features

### 5-Layer Protection:

1. **AI-Level**: AI model trained to generate only SELECT queries
2. **Keyword Blacklist**: DELETE, DROP, INSERT, UPDATE, etc. blocked
3. **Injection Detection**: Pattern matching for SQL injection attempts
4. **Query Structure**: Validates syntax, balanced parentheses, single statements
5. **Sanitization**: Comment removal, encoded command detection

### Auto-Safety:

- ✅ Automatic `deleted_at IS NULL` filters
- ✅ Result limit enforcement (max 1000 rows)
- ✅ Query timeout (30 seconds)
- ✅ Read-only database user recommended

## 📋 Prerequisites

- **Node.js**: v18+
- **Angular CLI**: v17+
- **MySQL**: 5.7+ or 8.0+
- **OpenRouter API Key**: Free tier available

## 🚀 Installation

### 1. Clone Repository

```bash
cd /Users/madewitarsana/Documents/Job/Chronicle/sql
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your credentials
nano .env
```

**Required Environment Variables:**

```env
# Database
DATABASE_HOST=your_database_host
DATABASE_NAME=your_database_name
DATABASE_USER=your_database_user
DATABASE_PASSWORD=your_database_password
DATABASE_PORT=3306

# AI (OpenRouter - Free Tier)
OPENROUTER_API_KEY=your_openrouter_api_key_here
```

**Get OpenRouter API Key (FREE):**

1. Go to https://openrouter.ai/
2. Sign up with your email (it's free!)
3. Navigate to https://openrouter.ai/keys
4. Click "Create Key"
5. Copy the API key and paste into `.env`
6. Free tier includes access to various open-source models

### 3. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Update API URL if needed (default: localhost:3000)
# Edit: src/environments/environment.ts
```

## 🎮 Running the Application

### Development Mode

**Terminal 1 - Backend:**

```bash
cd backend
npm run dev
```

Server runs on: http://localhost:3000

**Terminal 2 - Frontend:**

```bash
cd frontend
npm start
```

UI runs on: http://localhost:4200

### Production Build

**Backend:**

```bash
cd backend
npm run build
npm start
```

**Frontend:**

```bash
cd frontend
npm run build
# Deploy dist/chronicle-nl-query to web server
```

## 🧪 Testing

### Backend Tests

```bash
cd backend
npm test
```

### Health Check

```bash
curl http://localhost:3000/health
```

Expected response:

```json
{
  "status": "healthy",
  "services": {
    "database": "connected",
    "ai": "available"
  },
  "timestamp": "2025-12-08T...",
  "uptime": 123.45,
  "environment": "development"
}
```

## 📚 API Endpoints

### POST `/api/query`

Execute natural language query.

**Request:**

```json
{
  "question": "Show me all available plots in section A",
  "role": "Sales",
  "sessionId": "optional_session_id"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "rows": [...],
    "columns": ["plot_id", "plot_number", ...],
    "rowCount": 15
  },
  "metadata": {
    "executionTime": 234,
    "generatedSQL": "SELECT...",
    "role": "Sales",
    "timestamp": "2025-12-08T..."
  }
}
```

### GET `/api/examples`

Get example queries by category.

### GET `/api/schema`

Get database schema information.

### GET `/health`

Health check endpoint.

## 👥 User Roles

| Role           | Access Level                | Use Case                                     |
| -------------- | --------------------------- | -------------------------------------------- |
| **Admin**      | Full read access            | System administration, comprehensive reports |
| **Sales**      | Plot availability & pricing | Customer inquiries, sales process            |
| **Operations** | Plot status & occupancy     | Day-to-day management                        |
| **Management** | Statistics & aggregates     | Decision making, KPIs                        |

## 🔍 Query Examples

### Plot Availability

```
- Show me all available plots in section A
- How many empty plots are in section B?
- List all family plots that are available
- Which plots are reserved?
```

### Occupancy

```
- Which plots are currently occupied?
- Show me all graves in section C
- List all deceased persons buried in 2024
```

### Statistics

```
- How many available plots do we have in total?
- What is the occupancy rate by section?
- Show me the most expensive available plots
```

### Search

```
- Find person named John Smith
- Show all plots in row 5
- List all plots larger than 15 square meters
```

## 🗄️ Database Schema

The system works with these Chronicle tables:

- **plots**: Cemetery plot information
- **graves**: Burial records
- **persons**: Deceased and contact persons
- **sections**: Cemetery sections/areas
- **plot_statuses**: Plot status types (Available, Occupied, Reserved)
- **plot_reservations**: Plot reservation records

## 🛡️ Security Best Practices

### Database Security

1. Create a **read-only** database user:

```sql
CREATE USER 'chronicle_readonly'@'%' IDENTIFIED BY 'strong_password';
GRANT SELECT ON aus_dev_chronicle_dev.* TO 'chronicle_readonly'@'%';
FLUSH PRIVILEGES;
```

2. Update `.env` with read-only credentials

### Application Security

- ✅ Never expose API key in frontend
- ✅ Use CORS whitelist (configured in backend)
- ✅ Implement rate limiting for production
- ✅ Use HTTPS in production
- ✅ Regular security audits

### Query Validation

- ✅ All queries validated before execution
- ✅ Forbidden keywords blocked
- ✅ SQL injection patterns detected
- ✅ Result limits enforced
- ✅ Timeout protection

## 📊 Monitoring & Logging

### Logs Location

```
backend/logs/
├── error.log       # Error-level logs
└── combined.log    # All logs
```

### Log Rotation

- Max file size: 5MB
- Max files: 5
- Format: JSON (production) / Pretty (development)

### What's Logged

- All incoming requests
- Query generation (AI calls)
- SQL execution (with timing)
- Errors with stack traces
- Security violations

## 🚨 Troubleshooting

### "Database connection failed"

- Check database host is accessible
- Verify credentials in `.env`
- Check firewall rules
- Test connection: `mysql -h 103.186.63.189 -u chronicle -p`

### "AI service unavailable"

- Verify `ANTHROPIC_API_KEY` in `.env`
- Check API key is valid
- Test: `curl http://localhost:3000/health`

### "CORS error" in browser

- Update `ALLOWED_ORIGINS` in backend `.env`
- Add frontend URL: `http://localhost:4200`

### "Query timeout"

- Simplify the question
- Check database performance
- Increase `QUERY_TIMEOUT_MS` in `.env`

## 🔄 Updating

### Backend Dependencies

```bash
cd backend
npm update
npm audit fix
```

### Frontend Dependencies

```bash
cd frontend
npm update
```

### Database Schema Changes

If Chronicle database schema changes:

1. Update `backend/src/models/schema.model.ts`
2. Update `backend/src/prompts/system-prompt.ts`
3. Restart backend

## 📈 Performance

### Expected Response Times

- Simple queries: 200-500ms
- Complex joins: 500-1500ms
- Aggregate queries: 300-800ms

### Optimization Tips

- Use specific questions (better SQL generation)
- Select specific sections (reduce dataset)
- Avoid "show all" queries
- Database indexes on frequently queried columns

## 🤝 Support

### Common Issues

1. AI generates incorrect SQL → Rephrase question more specifically
2. No results found → Check data exists in database
3. Slow queries → Review generated SQL, add database indexes

### Contact

- Technical Lead: [Your Name]
- Email: [Your Email]
- Documentation: See `/docs` folder

## 📝 License

**PROPRIETARY** - Chronicle Cemetery Software
Internal use only. Not for redistribution.

## 🎉 Quick Start Checklist

- [ ] Node.js installed
- [ ] Backend dependencies installed (`npm install`)
- [ ] `.env` file configured with database credentials
- [ ] Anthropic API key added to `.env`
- [ ] Backend running (`npm run dev`)
- [ ] Frontend dependencies installed
- [ ] Frontend running (`npm start`)
- [ ] Health check passes
- [ ] Try example query: "Show me all available plots"

---

**Built with:** Node.js • Fastify • Knex • MySQL • Claude AI • Angular • TypeScript

**Version:** 1.0.0 | **Last Updated:** December 2025
