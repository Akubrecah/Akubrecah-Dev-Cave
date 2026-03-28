import * as dotenv from 'dotenv';
dotenv.config();

import { createClerkClient } from '@clerk/backend';
import { Client } from 'pg';

const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY || '';
const DATABASE_URL = process.env.DATABASE_URL || '';
const SUPER_ADMIN_EMAIL = 'poweldayck@gmail.com';

async function main() {
  if (!CLERK_SECRET_KEY || !DATABASE_URL) {
    console.error('Error: missing env vars');
    process.exit(1);
  }

  const pgClient = new Client({ connectionString: DATABASE_URL });
  await pgClient.connect();
  console.log('Connected to DB');

  const clerk = createClerkClient({ secretKey: CLERK_SECRET_KEY });
  console.log('Fetching users from Clerk...');

  const response = await clerk.users.getUserList();
  // @ts-ignore
  const clerkUsers = response.data || [];
  console.log(`Found ${clerkUsers.length} users.`);

  for (const u of clerkUsers) {
    const email = (u.emailAddresses[0]?.emailAddress || '').toLowerCase();
    const clerkId = u.id;
    const firstName = u.firstName || '';
    const lastName = u.lastName || '';
    const name = `${firstName} ${lastName}`.trim() || null;
    
    const isAdmin = email === SUPER_ADMIN_EMAIL.toLowerCase() || email.includes('akubrecah');
    const role = isAdmin ? 'admin' : 'personal';

    console.log(`Syncing ${email} as ${role}...`);

    await pgClient.query(`
      INSERT INTO "User" (id, "clerkId", email, name, role, "updatedAt")
      VALUES ($1, $2, $3, $4, $5, NOW())
      ON CONFLICT ("clerkId") DO UPDATE SET
        email = EXCLUDED.email,
        name = EXCLUDED.name,
        role = CASE WHEN "User".role = 'admin' THEN 'admin' ELSE EXCLUDED.role END,
        "updatedAt" = NOW()
    `, [crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11), clerkId, email, name, role]);
  }

  await pgClient.end();
  console.log('Done!');
}

main().catch(console.error);
