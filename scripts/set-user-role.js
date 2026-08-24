#!/usr/bin/env node
// One-off admin tool: set a portal user's role directly in the database.
// Needed to bootstrap the very first admin (nobody can use the Users
// Management page to promote anyone until at least one admin exists).
//
// Usage: node scripts/set-user-role.js <email> <admin|manager|viewer>

require('dotenv').config();
const { MongoClient } = require('mongodb');

const VALID_ROLES = ['admin', 'manager', 'viewer'];

async function main() {
  const [, , email, role] = process.argv;

  if (!email || !role) {
    console.error('Usage: node scripts/set-user-role.js <email> <admin|manager|viewer>');
    process.exit(1);
  }
  if (!VALID_ROLES.includes(role)) {
    console.error(`Invalid role "${role}". Must be one of: ${VALID_ROLES.join(', ')}`);
    process.exit(1);
  }
  if (!process.env.DB_URL) {
    console.error('DB_URL is not set (expected in .env)');
    process.exit(1);
  }

  const client = new MongoClient(process.env.DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  try {
    await client.connect();
    const db = client.db('nustshuttles');
    const result = await db.collection('users').updateOne(
      { email: email },
      { $set: { role: role } }
    );

    if (result.matchedCount === 0) {
      console.error(`No user found with email "${email}"`);
      process.exit(1);
    }
    console.log(`OK: ${email} is now role "${role}" (matched ${result.matchedCount}, modified ${result.modifiedCount})`);
  } finally {
    await client.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
