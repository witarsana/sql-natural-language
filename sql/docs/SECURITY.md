# Chronicle NL Query System - Security Documentation

## Overview

This document outlines the security architecture, threat model, and best practices for the Chronicle Natural Language Query System.

## Security Architecture

### Multi-Layer Defense

```
┌─────────────────────────────────────────┐
│ Layer 1: AI Prompt Engineering          │  ← Claude trained for SELECT only
├─────────────────────────────────────────┤
│ Layer 2: Keyword Blacklist              │  ← Block DELETE, DROP, etc.
├─────────────────────────────────────────┤
│ Layer 3: Injection Pattern Detection    │  ← Detect SQL injection attempts
├─────────────────────────────────────────┤
│ Layer 4: Query Structure Validation     │  ← Syntax, parentheses, statements
├─────────────────────────────────────────┤
│ Layer 5: Final Sanitization             │  ← Remove comments, check encoding
└─────────────────────────────────────────┘
```

## Implemented Security Measures

### 1. Read-Only Query Enforcement

**Mechanism:** Multiple validation layers ensure only SELECT queries execute.

**Blocked Operations:**

- `DELETE` - Data deletion
- `DROP` - Table/database deletion
- `INSERT` - Data insertion
- `UPDATE` - Data modification
- `ALTER` - Schema changes
- `CREATE` - Object creation
- `TRUNCATE` - Table truncation
- `EXEC/EXECUTE` - Stored procedure execution
- `MERGE` - Data merge operations
- `GRANT/REVOKE` - Permission changes

**Implementation:**

```typescript
// validation.service.ts
const FORBIDDEN_KEYWORDS = [
  "DELETE",
  "DROP",
  "TRUNCATE",
  "UPDATE",
  "INSERT",
  "ALTER",
  "CREATE",
  "REPLACE",
  "EXEC",
  "EXECUTE",
  "SCRIPT",
  "MERGE",
  "CALL",
  "GRANT",
  "REVOKE",
];
```

### 2. SQL Injection Protection

**Pattern Detection:**

- Union-based injection
- Stacked queries (`;`)
- Comment-based bypass (`--`, `/**/`)
- Hex-encoded attacks
- URL-encoded commands
- Subquery injection

**Example Blocked Queries:**

```sql
-- Stacked query attack
SELECT * FROM plots; DROP TABLE plots;--

-- Union injection
SELECT * FROM plots UNION SELECT * FROM mysql.user

-- Comment injection
SELECT * FROM plots WHERE 1=1 --
```

**Implementation:**

```typescript
// sql-sanitizer.ts
checkInjectionPatterns(sql: string) {
  const patterns = [
    /;\s*DROP/i,
    /UNION\s+SELECT.*INTO/i,
    /xp_cmdshell/i
  ];
  // ... validation logic
}
```

### 3. Automatic Safety Filters

**Soft Delete Filtering:**
All queries automatically include `deleted_at IS NULL` filters.

**Before:**

```sql
SELECT * FROM plots WHERE plot_status_id = 1
```

**After:**

```sql
SELECT * FROM plots WHERE plot_deleted_at IS NULL AND plot_status_id = 1
```

**Result Limits:**

- Maximum 1000 rows per query
- Automatically appended if missing
- Prevents memory exhaustion

### 4. Query Timeout Protection

**Configuration:**

```env
QUERY_TIMEOUT_MS=30000  # 30 seconds
```

**Purpose:**

- Prevent long-running queries
- Protect against resource exhaustion
- Ensure responsive user experience

### 5. Database User Permissions

**Recommended Setup:**

```sql
-- Create read-only user
CREATE USER 'chronicle_readonly'@'%' IDENTIFIED BY 'SecurePassword123!';

-- Grant only SELECT
GRANT SELECT ON aus_dev_chronicle_dev.* TO 'chronicle_readonly'@'%';

-- Revoke dangerous privileges
REVOKE INSERT, UPDATE, DELETE, DROP ON *.* FROM 'chronicle_readonly'@'%';

FLUSH PRIVILEGES;
```

**Benefits:**

- Database-level protection
- Even if validation fails, no modification possible
- Audit trail at database level

### 6. AI Prompt Engineering

**System Prompt Security:**

- Explicit instructions: "ONLY generate SELECT queries"
- Schema-aware generation
- Role-based context
- Examples of safe queries

**Temperature Setting:**

```typescript
temperature: 0.2; // Low temperature for consistent, predictable SQL
```

### 7. Input Validation

**Request Validation (Zod):**

```typescript
const queryRequestSchema = z.object({
  question: z.string().min(1).max(500), // Length limits
  role: z.nativeEnum(UserRole), // Enum validation
  sessionId: z.string().optional(),
});
```

**Constraints:**

- Question length: 1-500 characters
- Role: Must be valid enum value
- No special characters in session ID

### 8. CORS Protection

**Configuration:**

```typescript
// cors.middleware.ts
origin: (origin, callback) => {
  const allowedOrigins = env.ALLOWED_ORIGINS.split(",");
  if (allowedOrigins.includes(origin)) {
    callback(null, true);
  } else {
    callback(new Error("Not allowed by CORS"), false);
  }
};
```

**Production Setup:**

```env
ALLOWED_ORIGINS=https://chronicle.yourdomain.com
```

## Threat Model

### Threats Addressed

| Threat              | Mitigation                             | Severity  |
| ------------------- | -------------------------------------- | --------- |
| SQL Injection       | 5-layer validation + keyword blacklist | ✅ HIGH   |
| Data Modification   | Read-only enforcement + DB permissions | ✅ HIGH   |
| Schema Disclosure   | Whitelist allowed tables/fields        | ✅ MEDIUM |
| DoS (Long Queries)  | Query timeout + result limits          | ✅ MEDIUM |
| DoS (Rate Abuse)    | **TODO: Implement rate limiting**      | ⚠️ MEDIUM |
| Unauthorized Access | **TODO: Implement authentication**     | ⚠️ HIGH   |
| API Key Exposure    | Server-side only, never in frontend    | ✅ HIGH   |
| CORS Attacks        | Whitelist-based CORS                   | ✅ MEDIUM |

### Threats Requiring Additional Mitigation

#### 1. Authentication & Authorization

**Current State:** No authentication
**Risk:** Anyone with API access can query data
**Recommendation:**

```typescript
// Implement JWT authentication
import jwt from "jsonwebtoken";

fastify.addHook("onRequest", async (request, reply) => {
  const token = request.headers.authorization?.split(" ")[1];
  if (!token) {
    reply.status(401).send({ error: "Unauthorized" });
  }
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  request.user = decoded;
});
```

#### 2. Rate Limiting

**Current State:** No rate limiting
**Risk:** API abuse, DoS attacks
**Recommendation:**

```bash
npm install @fastify/rate-limit
```

```typescript
import rateLimit from "@fastify/rate-limit";

fastify.register(rateLimit, {
  max: 60, // 60 requests
  timeWindow: "1 minute",
  cache: 10000,
});
```

#### 3. Audit Logging

**Current State:** Basic logging
**Enhancement:**

```typescript
// Log all queries for audit
logger.info("Query executed", {
  userId: request.user?.id,
  role: validatedData.role,
  question: validatedData.question,
  generatedSQL: sanitizedSQL,
  rowCount: queryResult.rowCount,
  timestamp: new Date().toISOString(),
  ip: request.ip,
});
```

## Security Best Practices

### For Administrators

1. **Use Read-Only Database User**

   ```bash
   # Update .env
   DATABASE_USER=chronicle_readonly
   DATABASE_PASSWORD=SecurePassword123!
   ```

2. **Enable HTTPS in Production**

   ```bash
   # Use reverse proxy (nginx, Apache)
   # Force HTTPS redirect
   ```

3. **Rotate API Keys Regularly**

   ```bash
   # Update ANTHROPIC_API_KEY quarterly
   # Use environment-specific keys
   ```

4. **Monitor Query Logs**

   ```bash
   # Review logs/error.log daily
   # Set up alerts for suspicious patterns
   ```

5. **Implement Rate Limiting**
   ```typescript
   // See "Threats Requiring Additional Mitigation"
   ```

### For Developers

1. **Never Log Sensitive Data**

   ```typescript
   // ❌ BAD
   logger.info("User password:", user.password);

   // ✅ GOOD
   logger.info("User authenticated:", { userId: user.id });
   ```

2. **Validate All Inputs**

   ```typescript
   // Always use Zod schemas
   const validated = schema.parse(input);
   ```

3. **Keep Dependencies Updated**

   ```bash
   npm audit
   npm update
   ```

4. **Review AI-Generated SQL**
   ```typescript
   // Always log generated SQL
   logger.info("Generated SQL:", { sql: aiResponse.sql });
   ```

### For Users

1. **Use Specific Queries**

   - ✅ "Show plots in section A"
   - ❌ "Show all plots" (may hit result limit)

2. **Report Suspicious Behavior**

   - Unexpected results
   - Error messages
   - Slow queries

3. **Don't Share Session IDs**
   - Keep your session private
   - Log out when done

## Incident Response

### If SQL Injection Detected

1. **Immediate:**

   - Query blocked automatically
   - Error logged with details
   - Alert appears in logs

2. **Investigation:**

   ```bash
   # Check logs
   grep "SQL injection" logs/error.log

   # Identify source IP
   grep "suspicious pattern" logs/combined.log
   ```

3. **Response:**
   - Block IP if repeated attempts
   - Review validation rules
   - Update patterns if needed

### If Unauthorized Access

1. **Immediate:**

   - Revoke compromised credentials
   - Rotate API keys
   - Check audit logs

2. **Investigation:**

   - Identify accessed data
   - Review all queries from session
   - Determine breach scope

3. **Prevention:**
   - Implement authentication
   - Enable rate limiting
   - Enhanced monitoring

## Compliance Considerations

### Data Privacy

- **GDPR**: Personal data in `persons` table
- **Recommendation**: Implement data access controls by role
- **Consideration**: Add consent tracking

### Audit Requirements

- All queries logged with timestamp
- User role tracked
- Generated SQL recorded
- Result counts logged

### Data Retention

```typescript
// Implement log rotation
// Keep audit logs for 1 year minimum
// Secure backup of logs
```

## Security Checklist

### Pre-Production

- [ ] Read-only database user configured
- [ ] HTTPS enabled
- [ ] CORS whitelist configured
- [ ] API keys rotated and secured
- [ ] Rate limiting implemented
- [ ] Authentication enabled
- [ ] Audit logging configured
- [ ] Monitoring alerts set up
- [ ] Security testing completed
- [ ] Documentation reviewed

### Ongoing

- [ ] Weekly log reviews
- [ ] Monthly security audits
- [ ] Quarterly penetration testing
- [ ] Annual security assessment
- [ ] Dependency updates (monthly)
- [ ] API key rotation (quarterly)

## Contact

**Security Issues:** Report to technical lead immediately
**Questions:** Refer to this document or contact DevOps team

---

**Last Updated:** December 2025
**Document Version:** 1.0
**Review Schedule:** Quarterly
