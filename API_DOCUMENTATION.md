# HomeOps User Management API Documentation

## Overview

The HomeOps API provides endpoints for user authentication, profile management, and user data operations. This documentation covers all user-related endpoints.

## Base URL

```
http://localhost:3000
```

## Authentication

Currently, the API uses simple email-based identification. In production, implement proper authentication with JWT tokens or session management.

## User Management Endpoints

### 1. User Login/Creation

**POST** `/api/user/login`

Creates a new user or logs in an existing user. Users are automatically created if they don't exist.

#### Request Body

```json
{
  "email": "user@example.com",
  "name": "John Doe"
}
```

#### Response

**Success (200)**
```json
{
  "success": true,
  "userId": "dXNlckBleGFtcGxl",
  "profile": {
    "name": "John Doe",
    "email": "user@example.com",
    "preferences": {
      "primaryFocus": "family",
      "emailBatching": true,
      "notifications": {
        "urgent": true,
        "daily": true,
        "weekly": false
      },
      "insights": {
        "aiGenerated": true,
        "contextual": true,
        "predictive": false
      }
    },
    "lastLogin": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error (500)**
```json
{
  "success": false,
  "error": "Error message"
}
```

#### Example

```bash
curl -X POST http://localhost:3000/api/user/login \
  -H "Content-Type: application/json" \
  -d '{"email": "john@example.com", "name": "John Doe"}'
```

### 2. Update User Preferences

**POST** `/api/user/preferences`

Updates user preferences and settings.

#### Request Body

```json
{
  "userId": "dXNlckBleGFtcGxl",
  "preferences": {
    "primaryFocus": "work",
    "emailBatching": false,
    "notifications": {
      "urgent": true,
      "daily": false,
      "weekly": true
    }
  }
}
```

#### Response

**Success (200)**
```json
{
  "success": true,
  "preferences": {
    "primaryFocus": "work",
    "emailBatching": false,
    "notifications": {
      "urgent": true,
      "daily": false,
      "weekly": true
    },
    "insights": {
      "aiGenerated": true,
      "contextual": true,
      "predictive": false
    }
  }
}
```

**Error (400)**
```json
{
  "success": false,
  "error": "Missing userId or preferences"
}
```

**Error (404)**
```json
{
  "success": false,
  "error": "User not found"
}
```

#### Example

```bash
curl -X POST http://localhost:3000/api/user/preferences \
  -H "Content-Type: application/json" \
  -d '{"userId": "dXNlckBleGFtcGxl", "preferences": {"primaryFocus": "work"}}'
```

### 3. Get Dashboard Summary

**GET** `/api/dashboard-summary?userId=<userId>`

Retrieves user's dashboard data including emails, events, and insights.

#### Parameters

- `userId` (string, optional): User ID. Defaults to 'default' if not provided.

#### Response

**Success (200)**
```json
{
  "success": true,
  "summary": {
    "urgent": 5,
    "events": 3,
    "commerce": 2,
    "insights": 8
  },
  "userId": "dXNlckBleGFtcGxl",
  "dataSource": "real"
}
```

#### Example

```bash
curl "http://localhost:3000/api/dashboard-summary?userId=dXNlckBleGFtcGxl"
```

## User Profile Structure

### Complete User Profile

```json
{
  "id": "dXNlckBleGFtcGxl",
  "name": "John Doe",
  "email": "john@example.com",
  "preferences": {
    "primaryFocus": "family",
    "emailBatching": true,
    "notifications": {
      "urgent": true,
      "daily": true,
      "weekly": false
    },
    "insights": {
      "aiGenerated": true,
      "contextual": true,
      "predictive": false
    }
  },
  "mentalLoad": {
    "currentScore": 65,
    "trend": "stable",
    "history": []
  },
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "lastLogin": "2024-01-01T00:00:00.000Z"
}
```

### Preference Options

#### Primary Focus
- `"family"` - Family-focused insights and prioritization
- `"work"` - Work-focused insights and prioritization  
- `"personal"` - Personal development focused

#### Notifications
- `urgent` (boolean) - Immediate notifications for urgent items
- `daily` (boolean) - Daily summary notifications
- `weekly` (boolean) - Weekly digest notifications

#### Insights
- `aiGenerated` (boolean) - Enable AI-generated insights
- `contextual` (boolean) - Enable contextual suggestions
- `predictive` (boolean) - Enable predictive analytics

## Error Handling

All endpoints return errors in the following format:

```json
{
  "success": false,
  "error": "Error description"
}
```

### Common Error Codes

- **400 Bad Request**: Missing required parameters
- **404 Not Found**: User or resource not found
- **500 Internal Server Error**: Server-side error

## Rate Limiting

Currently no rate limiting is implemented. In production, implement appropriate rate limiting based on your needs.

## Integration Examples

### JavaScript/Node.js

```javascript
const fetch = require('node-fetch');

// Create or login user
async function loginUser(email, name) {
  const response = await fetch('http://localhost:3000/api/user/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, name })
  });
  
  return await response.json();
}

// Update user preferences
async function updatePreferences(userId, preferences) {
  const response = await fetch('http://localhost:3000/api/user/preferences', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId, preferences })
  });
  
  return await response.json();
}
```

### Python

```python
import requests
import json

def login_user(email, name):
    url = "http://localhost:3000/api/user/login"
    data = {"email": email, "name": name}
    response = requests.post(url, json=data)
    return response.json()

def update_preferences(user_id, preferences):
    url = "http://localhost:3000/api/user/preferences"
    data = {"userId": user_id, "preferences": preferences}
    response = requests.post(url, json=data)
    return response.json()
```

### cURL Examples

```bash
# Create user
curl -X POST http://localhost:3000/api/user/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "name": "User Name"}'

# Update preferences
curl -X POST http://localhost:3000/api/user/preferences \
  -H "Content-Type: application/json" \
  -d '{"userId": "userId", "preferences": {"primaryFocus": "work"}}'

# Get dashboard
curl "http://localhost:3000/api/dashboard-summary?userId=userId"
```

## Best Practices

1. **Email Validation**: Always validate email formats before sending requests
2. **Error Handling**: Implement proper error handling for all API calls
3. **User IDs**: Store user IDs securely on the client side
4. **Preferences**: Only send changed preferences to minimize data transfer
5. **Retries**: Implement retry logic for network failures

## Production Considerations

- Implement proper authentication (JWT, OAuth, etc.)
- Add input validation and sanitization
- Set up proper database storage instead of in-memory storage
- Add logging and monitoring
- Implement rate limiting and DDoS protection
- Add HTTPS/TLS encryption
- Set up user data backup and recovery systems