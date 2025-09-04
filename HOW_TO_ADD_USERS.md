# How to Add Users to HomeOps

This guide explains the multiple ways to add and manage users in the HomeOps system.

## Quick Start

### Method 1: Automatic User Creation (Recommended)
Users are automatically created when they first log in through the web interface:

1. Navigate to `/onboard` in your browser
2. Enter email and name
3. User profile is automatically created

### Method 2: Web Admin Interface
Use the built-in admin interface for manual user management:

1. Start the server: `npm start`
2. Navigate to `/admin` in your browser
3. Use the web interface to add users individually or in bulk

### Method 3: Command Line Tool
Use the CLI tool for batch operations:

```bash
# Add a single user
node scripts/add-user.js --email "user@example.com" --name "John Doe"

# Add multiple users from CSV
node scripts/add-user.js --file sample-users.csv

# Show help
node scripts/add-user.js --help
```

### Method 4: API Integration
Integrate user creation into your applications:

```bash
curl -X POST http://localhost:3000/api/user/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "name": "John Doe"}'
```

## User Management Features

✅ **Multiple Creation Methods**
- Web interface (automatic and manual)
- Command-line tool
- REST API
- Bulk CSV import

✅ **User Profile System**
- Automatic ID generation from email
- Customizable preferences
- Default settings for new users
- Profile management

✅ **Admin Interface**
- User listing and management
- Bulk import from CSV files
- Sample data download
- Real-time user creation

✅ **Developer Tools**
- CLI tool with help system
- API documentation
- Code examples
- Utility functions

## Files Added/Modified

### Documentation
- `USER_MANAGEMENT.md` - Comprehensive user management guide
- `API_DOCUMENTATION.md` - Complete API documentation

### Tools
- `scripts/add-user.js` - Command-line tool for user management
- `utils/user-utils.js` - Shared utility functions
- `test-user-server.js` - Test server for demonstration

### Web Interface
- `public/admin-users.html` - Web-based admin interface
- Added admin routes to `quick-server.js`

### Sample Data
- `sample-users.csv` - Example CSV file for bulk import

## Testing

To test the user management system:

1. **Start the test server:**
   ```bash
   node test-user-server.js
   ```

2. **Open the admin interface:**
   ```
   http://localhost:3001/admin
   ```

3. **Test the CLI tool:**
   ```bash
   node scripts/add-user.js --email "test@example.com" --name "Test User"
   ```

4. **Test bulk import:**
   ```bash
   node scripts/add-user.js --file sample-users.csv
   ```

## Production Notes

- Replace in-memory storage with a proper database
- Implement authentication and session management
- Add user roles and permissions
- Set up data backup and recovery
- Implement GDPR compliance features

## Screenshots

### Admin Interface
![User Management Interface](https://github.com/user-attachments/assets/49cb4b6b-8e34-4381-bda1-5702c104b50f)

### Admin Interface with Users
![Admin Interface with User List](https://github.com/user-attachments/assets/af584240-3ae7-4bce-8afe-9ccfc778b91d)

## Need Help?

- Check `USER_MANAGEMENT.md` for detailed instructions
- See `API_DOCUMENTATION.md` for API reference
- Run `node scripts/add-user.js --help` for CLI help
- Review the test server code in `test-user-server.js`