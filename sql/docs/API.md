# Chronicle Natural Language Query System - API Documentation

## Base URL

Development: `http://localhost:3000/api`
Production: `https://your-domain.com/api`

## Authentication

Currently no authentication is required. Implement token-based auth for production.

## Endpoints

### 1. Execute Query

**POST** `/query`

Execute a natural language query against the Chronicle database.

#### Request

```json
{
  "question": "Show me all available plots in section A",
  "role": "Sales",
  "sessionId": "session_1234567890_abc123"
}
```

**Parameters:**

- `question` (string, required): Natural language question (1-500 characters)
- `role` (string, required): User role - one of: `Admin`, `Sales`, `Operations`, `Management`
- `sessionId` (string, optional): Session identifier for tracking

#### Response - Success

```json
{
  "success": true,
  "data": {
    "rows": [
      {
        "plot_id": 123,
        "plot_number": "A-15",
        "plot_status_name": "Available",
        "section_name": "Section A",
        "plot_area": 12.5,
        "plot_price": 5000.0
      }
    ],
    "columns": [
      "plot_id",
      "plot_number",
      "plot_status_name",
      "section_name",
      "plot_area",
      "plot_price"
    ],
    "rowCount": 1
  },
  "metadata": {
    "executionTime": 234,
    "generatedSQL": "SELECT plots.plot_id, plots.plot_number, plot_statuses.plot_status_name, sections.section_name, plots.plot_area, plots.plot_price FROM plots LEFT JOIN plot_statuses ON plots.plot_status_id = plot_statuses.plot_status_id LEFT JOIN sections ON plots.plot_section_id = sections.section_id WHERE plots.plot_deleted_at IS NULL AND sections.section_name = 'A' AND plot_statuses.plot_status_name = 'Available' ORDER BY plots.plot_row, plots.plot_column LIMIT 1000",
    "role": "Sales",
    "timestamp": "2025-12-08T12:34:56.789Z"
  }
}
```

#### Response - Error

```json
{
  "success": false,
  "error": "Forbidden SQL keyword detected: DELETE",
  "code": "VALIDATION_ERROR"
}
```

**Status Codes:**

- `200 OK`: Query executed successfully
- `400 Bad Request`: Validation error or malformed request
- `500 Internal Server Error`: Database or AI service error

---

### 2. Get Example Queries

**GET** `/examples`

Retrieve categorized example queries to help users.

#### Response

```json
{
  "success": true,
  "examples": [
    {
      "category": "Plot Availability",
      "queries": [
        "Show me all available plots in section A",
        "How many empty plots are in section B?",
        "List all family plots that are available"
      ]
    },
    {
      "category": "Occupancy",
      "queries": [
        "Which plots are currently occupied?",
        "Show me all graves in section C",
        "List all deceased persons buried in 2024"
      ]
    }
  ]
}
```

---

### 3. Get Schema Information

**GET** `/schema`

Get database schema information for reference.

#### Response

```json
{
  "success": true,
  "schema": {
    "tables": [
      {
        "name": "plots",
        "description": "Cemetery plot information",
        "commonFields": [
          "plot_id",
          "plot_number",
          "plot_section_id",
          "plot_status_id",
          "plot_area"
        ]
      },
      {
        "name": "graves",
        "description": "Burial records",
        "commonFields": [
          "grave_id",
          "grave_plot_id",
          "grave_person_id",
          "grave_burial_date"
        ]
      }
    ],
    "commonTerms": {
      "available": "Plots with status 'Available'",
      "occupied": "Plots with burial records",
      "empty": "Plots without burial records",
      "reserved": "Plots with active reservations",
      "familyPlot": "Plots with area >= 10 or width >= 3"
    }
  }
}
```

---

### 4. Health Check

**GET** `/health`

Check system health and service availability.

#### Response

```json
{
  "status": "healthy",
  "services": {
    "database": "connected",
    "ai": "available"
  },
  "timestamp": "2025-12-08T12:34:56.789Z",
  "uptime": 123.45,
  "environment": "development"
}
```

**Status Values:**

- `healthy`: All services operational
- `unhealthy`: One or more services down

---

## Error Codes

| Code               | Description                                                 |
| ------------------ | ----------------------------------------------------------- |
| `VALIDATION_ERROR` | Query failed validation (SQL injection, forbidden keywords) |
| `DATABASE_ERROR`   | Database connection or execution error                      |
| `AI_ERROR`         | AI service unavailable or failed to generate SQL            |

## Rate Limiting

**Development**: No limits
**Production**: Implement rate limiting (recommended: 60 requests/minute per IP)

## Query Constraints

- Maximum question length: 500 characters
- Maximum result rows: 1000
- Query timeout: 30 seconds
- Only SELECT queries allowed
- Automatic `deleted_at` filtering

## Natural Language Mappings

The AI understands these terms:

| Natural Language | SQL Translation                          |
| ---------------- | ---------------------------------------- |
| "available"      | `plot_status_name = 'Available'`         |
| "occupied"       | `EXISTS (graves record)`                 |
| "empty"          | `NOT EXISTS (graves record)`             |
| "reserved"       | `plot_reservation_person_id IS NOT NULL` |
| "family plot"    | `plot_area >= 10 OR plot_width >= 3`     |

## Best Practices

### Query Optimization

- Be specific: "section A" instead of "all sections"
- Use date ranges: "in 2024" instead of "all time"
- Request only needed fields when possible

### Error Handling

```typescript
try {
  const response = await queryService.executeQuery(question, role);
  if (response.success) {
    // Handle results
  } else {
    // Handle error
    console.error(response.error);
  }
} catch (error) {
  // Handle network/timeout errors
}
```

### Session Management

- Generate unique `sessionId` per user session
- Store in localStorage or session storage
- Use for query tracking and analytics

## Examples

### Simple Query

```bash
curl -X POST http://localhost:3000/api/query \
  -H "Content-Type: application/json" \
  -d '{
    "question": "How many available plots are there?",
    "role": "Sales"
  }'
```

### Complex Query

```bash
curl -X POST http://localhost:3000/api/query \
  -H "Content-Type: application/json" \
  -d '{
    "question": "Show me all occupied plots in section B with burial dates in 2024",
    "role": "Operations"
  }'
```

### With Session ID

```bash
curl -X POST http://localhost:3000/api/query \
  -H "Content-Type: application/json" \
  -d '{
    "question": "List family plots",
    "role": "Admin",
    "sessionId": "session_1234567890_abc123"
  }'
```
