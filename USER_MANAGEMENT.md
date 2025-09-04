# HomeOps User Management Guide

## How to Add Users

The HomeOps system provides several methods for adding and managing users. Users are automatically created when they first log in, but you can also add them manually using the tools described below.

## User Creation Methods

### 1. Automatic User Creation (Recommended)

Users are automatically created when they log in through the web interface:

1. **Via Web Interface**: Navigate to `/onboard` or use the login flow
2. **API Login**: Send a POST request to `/api/user/login`

```javascript
// Example API call to create/login user
fetch('/api/user/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@example.com',
    name: 'John Doe'
  })
})
```

### 2. Manual User Creation via CLI

Use the provided CLI tool to add users manually:

```bash
# Add a single user
node scripts/add-user.js --email "user@example.com" --name "John Doe"

# Add multiple users from a file
node scripts/add-user.js --file users.csv
```

### 3. Programmatic User Creation

For developers integrating with HomeOps:

```javascript
const { generateUserId, createNewUserProfile } = require('./user-utils');

// Generate user ID from email
const userId = generateUserId('user@example.com');

// Create user profile
const profile = createNewUserProfile(userId, {
  name: 'John Doe',
  email: 'user@example.com'
});

// Store in system (this would be done automatically in production)
userProfiles.set(userId, profile);
```

## User Profile Structure

Each user profile contains the following information:

```javascript
{
  id: "generated-user-id",
  name: "User Name",
  email: "user@example.com",
  preferences: {
    primaryFocus: "family", // family, work, personal
    emailBatching: true,
    notifications: {
      urgent: true,
      daily: true,
      weekly: false
    },
    insights: {
      aiGenerated: true,
      contextual: true,
      predictive: false
    }
  },
  mentalLoad: {
    currentScore: 65,
    trend: "stable",
    history: []
  },
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
  lastLogin: "2024-01-01T00:00:00.000Z"
}
```

## API Endpoints

### User Authentication & Management

- `POST /api/user/login` - Create or login user
- `POST /api/user/preferences` - Update user preferences
- `GET /api/dashboard-summary?userId=<id>` - Get user dashboard data

### Example Requests

#### Create/Login User
```bash
curl -X POST http://localhost:3000/api/user/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "name": "John Doe"}'
```

#### Update User Preferences
```bash
curl -X POST http://localhost:3000/api/user/preferences \
  -H "Content-Type: application/json" \
  -d '{"userId": "user-id", "preferences": {"primaryFocus": "work"}}'
```

## User Management Best Practices

1. **Email-based Identification**: Users are identified by their email address
2. **Automatic Profile Creation**: Profiles are created automatically on first login
3. **Preference Customization**: Allow users to customize their preferences after creation
4. **Data Persistence**: In production, use a proper database instead of in-memory storage

## Troubleshooting

### Common Issues

1. **User Not Found**: Ensure the user has logged in at least once or been created manually
2. **Invalid Email**: Check that the email format is valid and unique
3. **Missing Dependencies**: Ensure all required packages are installed with `npm install`

### Debug User Creation

```bash
# Check if user exists
node -e "
const userId = require('./quick-server.js').generateUserId('user@example.com');
console.log('User ID:', userId);
"
```

## Production Considerations

- Replace in-memory storage with a proper database (PostgreSQL, MongoDB, etc.)
- Implement proper authentication and session management
- Add user roles and permissions
- Set up user data backup and recovery
- Implement user deletion and data export (GDPR compliance)

## Next Steps

1. Start the server: `npm start`
2. Navigate to `/onboard` to test user creation
3. Use the CLI tool to add users manually
4. Integrate with your authentication system as needed