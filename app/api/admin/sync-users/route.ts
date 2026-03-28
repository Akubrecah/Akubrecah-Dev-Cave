import { NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

const SUPER_ADMIN_EMAIL = 'poweldayck@gmail.com';

export async function GET() {
  try {
    const client = await clerkClient();
    let synced = 0;
    let offset = 0;
    const limit = 50;
    let hasMore = true;

    while (hasMore) {
      const { data: clerkUsers, totalCount } = await client.users.getUserList({ 
        offset, 
        limit 
      });

      if (clerkUsers.length === 0) {
        hasMore = false;
        break;
      }

      for (const clerkUser of clerkUsers) {
        const email = (clerkUser.emailAddresses[0]?.emailAddress || '').toLowerCase();
        const firstName = (clerkUser.firstName || '').toLowerCase();
        const lastName = (clerkUser.lastName || '').toLowerCase();
        const username = (clerkUser.username || '').toLowerCase();
        const fullName = `${firstName} ${lastName}`.trim();
        
        const isAdminIdentified = 
            email === SUPER_ADMIN_EMAIL.toLowerCase() || 
            email.includes('akubrecah') ||
            firstName.includes('akubrecah') ||
            lastName.includes('akubrecah') ||
            fullName.includes('akubrecah') ||
            username.includes('akubrecah');

        const role = isAdminIdentified ? 'admin' : 'personal';

        await prisma.user.upsert({
          where: { clerkId: clerkUser.id },
          update: {
            email,
            name: fullName || undefined,
            ...(isAdminIdentified ? { role: 'admin' } : {})
          },
          create: {
            clerkId: clerkUser.id,
            email,
            name: fullName || undefined,
            role,
          }
        });
        
        synced++;
      }

      offset += clerkUsers.length;
      if (offset >= totalCount) {
        hasMore = false;
      }
    }

    return NextResponse.json({ success: true, count: synced });
  } catch (error) {
    console.error('Error syncing clerk users:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
