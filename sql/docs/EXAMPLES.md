# Example Natural Language Queries for Chronicle

This document provides comprehensive examples of natural language queries that work with the Chronicle Query System.

## Plot Availability

### Basic Availability

```
Show me all available plots
List available plots in section A
Which plots are available in section B?
How many available plots do we have?
Give me a list of empty plots
```

### By Section

```
Show available plots in section C
List all empty plots in section A
Which sections have available plots?
How many plots are available in each section?
```

### By Size

```
Show all available family plots
List single plots that are available
Find available plots larger than 10 square meters
Show me available plots between 8 and 15 square meters
```

### By Price

```
Show the most expensive available plots
List available plots under $5000
Find available plots priced between $3000 and $7000
What's the cheapest available plot?
```

## Plot Occupancy

### Basic Occupancy

```
Which plots are currently occupied?
Show me all occupied plots
List plots that have graves
How many plots are occupied?
Which plots are empty?
```

### By Section

```
Show occupied plots in section B
Which plots in section A have burials?
How many occupied plots are in section C?
List empty plots in section D
```

### Recent Burials

```
Show all burials in 2024
List graves with burial dates in 2023
Which plots had burials in the last 6 months?
Show the most recent burials
```

## Person/Deceased Queries

### Basic Person Search

```
Find person named John Smith
Search for persons with last name Johnson
List all persons named Mary
Show me deceased persons born in 1950
```

### By Death Date

```
List all persons who died in 2024
Show deceased persons from January 2024
Find persons who died between 2020 and 2024
Who died in the last year?
```

### By Burial Location

```
Who is buried in section A?
List all persons buried in plot A-15
Show me burials in section B
Which deceased persons are in section C?
```

### Demographics

```
Show all female deceased persons
List male persons buried in section A
How many persons of each gender are buried?
Show deceased persons by nationality
```

## Reservations

### Basic Reservations

```
Show all reserved plots
Which plots have active reservations?
List plots reserved by John Doe
How many plots are currently reserved?
```

### Expiring Reservations

```
Show reservations expiring this month
List reservations expiring in the next 30 days
Which reservations expired in 2023?
Find all expired reservations
```

### By Person

```
Show all reservations for person ID 123
List plots reserved by Mary Johnson
Find reservations made by Smith family
```

## Statistics & Aggregations

### Counts

```
How many total plots do we have?
Count available plots by section
How many graves are there in total?
What's the total number of deceased persons?
Count plots by status
```

### Occupancy Rates

```
What is the occupancy rate overall?
Show occupancy rate by section
Which section has the highest occupancy?
Calculate available vs occupied ratio
```

### Revenue/Pricing

```
What's the total value of available plots?
Show average plot price by section
List sections by total plot value
What's the most expensive occupied plot?
```

### Capacity Analysis

```
How many plots can each section hold?
What percentage of section A is occupied?
Show remaining capacity by section
Which section is nearly full?
```

## Complex Queries

### Multi-Criteria

```
Show available family plots in section A under $10000
List occupied plots in section B with burials from 2024
Find reserved plots in section C expiring this year
Show empty single plots in section A priced under $5000
```

### Joins & Relationships

```
Show all plots with their status and section names
List graves with deceased person details and plot locations
Show reservations with person names and plot numbers
Find plots with multiple graves
```

### Time-Based

```
Show burial activity by month in 2024
List plots that became occupied in the last quarter
Find reservations made in the last 6 months
Show deceased persons by burial year
```

### Comparative

```
Compare available plots between section A and section B
Show the difference in average plot prices by section
Which section has more family plots?
Compare occupancy rates across all sections
```

## Section-Specific Queries

### Section Information

```
Show details of section A
List all sections with their capacities
Which section has the most plots?
Show section descriptions
```

### Section Analysis

```
What's the most popular section?
Which section has the highest average plot price?
Show sections with available family plots
List sections by occupancy percentage
```

## Plot Details

### Physical Attributes

```
Show plots with area greater than 15 square meters
List plots by row and column in section A
Find plots with width greater than 3 meters
Show the largest available plots
```

### Plot Status

```
Show all plots and their current status
List plots by status type
How many plots are in each status?
Find plots with notes
```

## Date Range Queries

### Specific Periods

```
Show all activity in Q1 2024
List burials between January and March 2024
Find reservations made in 2023
Show plots occupied in the last year
```

### Relative Dates

```
Show burials in the last 30 days
List reservations expiring next month
Find deaths in the current year
Show recent plot changes
```

## Export/Reporting Style Queries

### Summary Reports

```
Give me a summary of plot availability by section
Show me overall cemetery statistics
List all sections with occupancy rates
Generate a status report for section A
```

### Detailed Lists

```
Show complete plot information for section A
List all deceased persons with full details
Export all available plots with pricing
Show comprehensive burial records for 2024
```

## Tips for Better Queries

### ✅ Good Query Patterns

- Be specific about sections: "section A" not "a section"
- Use clear time periods: "in 2024" not "recently"
- Specify exact field names: "plot number" not "plot"
- Use proper terminology: "deceased persons" not "dead people"

### ❌ Avoid These Patterns

- Too vague: "show me stuff"
- Ambiguous time: "a while ago"
- Mixing unrelated concepts: "show plots and also pricing and maybe sections"
- Asking for modifications: "delete plot A-15"

## Role-Specific Query Examples

### Sales Role

```
Show available plots with pricing in section A
List family plots under $8000
What's the cheapest available plot in section B?
Show available plots sorted by price
```

### Operations Role

```
Show all graves that need maintenance
List occupied plots in section C
Which plots were recently filled?
Show burial activity this month
```

### Management Role

```
What's our overall occupancy rate?
Show revenue potential from available plots
List sections by performance
Generate monthly statistics report
```

### Admin Role

```
Show complete database statistics
List all plots with full details
Export all person records
Show system-wide activity report
```

## Natural Language Tips

The system understands:

- **"available"** = plots with status "Available"
- **"occupied"** = plots with grave records
- **"empty"** = plots without graves
- **"reserved"** = plots with active reservations
- **"family plot"** = plots with area ≥10 or width ≥3
- **"single plot"** = plots with area <10 and width <3

## Query Response Times

- Simple queries: 200-500ms
- Joins (2-3 tables): 500-1000ms
- Complex aggregations: 800-1500ms
- Large result sets: 1000-2000ms

## Result Limits

- Maximum 1000 rows per query
- For larger datasets, be more specific
- Use date ranges or section filters
- Consider aggregate functions (COUNT, SUM)

---

**Need help?** Start with example queries and modify them for your needs.
**Can't find what you need?** Try rephrasing your question more specifically.
