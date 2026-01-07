# Daily Stats API

## Endpoint
```
GET /analytics/daily-stats
```

## Description
Returns daily completion statistics showing how much the user has completed across different wellness categories and how much remains for the day.

## Authentication
Requires JWT authentication via `AuthGuard`.

## Query Parameters
- `date` (optional): Date string in ISO format (YYYY-MM-DD). Defaults to today if not provided.

## Response Format

```typescript
{
  date: string;                    // Date in YYYY-MM-DD format
  overallCompletion: number;       // Overall percentage (0-100)
  categories: CategoryStats[];     // Individual category stats
  summary: {
    totalActivities: number;       // Total number of tracked categories
    completedActivities: number;   // Number of 100% completed categories
    pendingActivities: number;     // Number of incomplete categories
  };
}

interface CategoryStats {
  category: string;      // Category name
  completed: number;     // Amount completed
  target: number;        // Target amount
  percentage: number;    // Completion percentage (0-100)
  remaining: number;     // Amount remaining to reach target
}
```

## Example Response

```json
{
  "date": "2026-01-07",
  "overallCompletion": 73,
  "categories": [
    {
      "category": "Sleep",
      "completed": 7.5,
      "target": 8,
      "percentage": 94,
      "remaining": 0.5
    },
    {
      "category": "Workout",
      "completed": 1,
      "target": 1,
      "percentage": 100,
      "remaining": 0
    },
    {
      "category": "Nutrition",
      "completed": 2,
      "target": 3,
      "percentage": 67,
      "remaining": 1
    },
    {
      "category": "Meditation",
      "completed": 1,
      "target": 1,
      "percentage": 100,
      "remaining": 0
    },
    {
      "category": "Fasting",
      "completed": 12,
      "target": 16,
      "percentage": 75,
      "remaining": 4
    },
    {
      "category": "Habits",
      "completed": 3,
      "target": 5,
      "percentage": 60,
      "remaining": 2
    }
  ],
  "summary": {
    "totalActivities": 6,
    "completedActivities": 2,
    "pendingActivities": 4
  }
}
```

## Default Targets

- **Sleep**: 8 hours
- **Workout**: 1 session per day
- **Nutrition**: 3 meals per day
- **Meditation**: 1 session per day
- **Fasting**: 16 hours
- **Habits**: Dynamic based on active habits count

## Usage Examples

### Get today's stats
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/analytics/daily-stats
```

### Get stats for a specific date
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/analytics/daily-stats?date=2026-01-05
```

## Frontend Integration Example

```javascript
// Fetch daily stats
const response = await fetch('/analytics/daily-stats', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const data = await response.json();

// Display overall completion
console.log(`Overall completion: ${data.overallCompletion}%`);

// Display individual category stats
data.categories.forEach(cat => {
  console.log(`${cat.category}: ${cat.percentage}% (${cat.completed}/${cat.target})`);
  console.log(`  Remaining: ${cat.remaining}`);
});
```

## Notes

- Percentages are capped at 100% even if user exceeds target
- The Habits category only appears if there are active habits in the system
- All time-based calculations use the user's timezone from the date parameter
- Sleep and Fasting show actual hours completed vs target hours
- Workout, Nutrition, Meditation show count of sessions/meals completed
