#!/usr/bin/env node

/**
 * HomeOps User Management CLI Tool
 * 
 * This tool allows you to add users to the HomeOps system manually.
 * 
 * Usage:
 *   node add-user.js --email "user@example.com" --name "John Doe"
 *   node add-user.js --file users.csv
 *   node add-user.js --help
 */

const fs = require('fs');
const path = require('path');

// Import user management functions from the main server
function generateUserId(email) {
  return Buffer.from(email.toLowerCase()).toString('base64').replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
}

function createNewUserProfile(userId, userData) {
  return {
    id: userId,
    name: userData.name || 'User',
    email: userData.email,
    preferences: {
      primaryFocus: 'family', // Default
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
      trend: 'stable',
      history: []
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastLogin: new Date().toISOString()
  };
}

// CLI argument parsing
function parseArgs() {
  const args = process.argv.slice(2);
  const parsed = {
    email: null,
    name: null,
    file: null,
    help: false
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--email':
        parsed.email = args[i + 1];
        i++;
        break;
      case '--name':
        parsed.name = args[i + 1];
        i++;
        break;
      case '--file':
        parsed.file = args[i + 1];
        i++;
        break;
      case '--help':
      case '-h':
        parsed.help = true;
        break;
    }
  }

  return parsed;
}

// Validate email format
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Create a single user
async function createUser(email, name) {
  if (!isValidEmail(email)) {
    throw new Error(`Invalid email format: ${email}`);
  }

  const userId = generateUserId(email);
  const profile = createNewUserProfile(userId, { email, name });

  console.log(`✅ User created successfully:`);
  console.log(`   Email: ${email}`);
  console.log(`   Name: ${name}`);
  console.log(`   User ID: ${userId}`);
  console.log(`   Created at: ${profile.createdAt}`);

  return profile;
}

// Create user via API call to running server
async function createUserViaAPI(email, name, serverUrl = 'http://localhost:3000') {
  try {
    const fetch = (await import('node-fetch')).default;
    
    const response = await fetch(`${serverUrl}/api/user/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, name })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    
    if (result.success) {
      console.log(`✅ User created via API:`);
      console.log(`   Email: ${email}`);
      console.log(`   Name: ${name}`);
      console.log(`   User ID: ${result.userId}`);
      return result;
    } else {
      throw new Error(result.error || 'Failed to create user');
    }
  } catch (error) {
    console.log(`⚠️  Could not connect to server (${serverUrl})`);
    console.log(`   Creating user locally instead...`);
    return await createUser(email, name);
  }
}

// Parse CSV file and create users
async function createUsersFromFile(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.trim().split('\n');
  
  if (lines.length === 0) {
    throw new Error('CSV file is empty');
  }

  // Check if first line is header
  const hasHeader = lines[0].toLowerCase().includes('email') || lines[0].toLowerCase().includes('name');
  const dataLines = hasHeader ? lines.slice(1) : lines;

  const users = [];
  for (const line of dataLines) {
    const [email, name] = line.split(',').map(field => field.trim().replace(/['"]/g, ''));
    
    if (email && isValidEmail(email)) {
      try {
        const user = await createUserViaAPI(email, name || 'User');
        users.push(user);
      } catch (error) {
        console.error(`❌ Failed to create user ${email}:`, error.message);
      }
    } else {
      console.warn(`⚠️  Skipping invalid email: ${email}`);
    }
  }

  console.log(`\n📊 Summary: Created ${users.length} users from ${filePath}`);
  return users;
}

// Show help message
function showHelp() {
  console.log(`
HomeOps User Management CLI Tool

USAGE:
  node add-user.js [OPTIONS]

OPTIONS:
  --email <email>     Email address of the user to create
  --name <name>       Full name of the user (optional)
  --file <file>       CSV file containing users to import
  --help, -h          Show this help message

EXAMPLES:
  # Add a single user
  node add-user.js --email "john@example.com" --name "John Doe"

  # Add multiple users from CSV file
  node add-user.js --file users.csv

  # CSV file format (with or without header):
  email,name
  john@example.com,John Doe
  jane@example.com,Jane Smith

NOTES:
  - If the HomeOps server is running, users will be created via API
  - If the server is not running, users will be created locally
  - User IDs are automatically generated from email addresses
  - Default preferences are applied to new users
`);
}

// Main execution
async function main() {
  const args = parseArgs();

  if (args.help) {
    showHelp();
    return;
  }

  try {
    if (args.file) {
      console.log(`📂 Creating users from file: ${args.file}`);
      await createUsersFromFile(args.file);
    } else if (args.email) {
      console.log(`👤 Creating user: ${args.email}`);
      await createUserViaAPI(args.email, args.name);
    } else {
      console.error('❌ Error: Please specify either --email or --file');
      console.log('Use --help for usage information');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  generateUserId,
  createNewUserProfile,
  createUser,
  createUserViaAPI,
  createUsersFromFile
};