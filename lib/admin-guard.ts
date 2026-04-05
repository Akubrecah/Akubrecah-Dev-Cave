import { auth, currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export type AdminUser = {
  id: string;
  clerkId: string;
  email: string;
  role: string;
};

/**
 * Verifies that the current request is from an admin user.
 * Returns the admin user if authorized, or a NextResponse error.
 */
export async function requireAdmin(): Promise<AdminUser | NextResponse> {
  const { userId } = await auth();
  
  if (!userId) {
    console.warn('[ADMIN_GUARD] No userId found in auth()');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Use currentUser() to get email for verification
  const userObj = await currentUser();
  const userEmail = userObj?.emailAddresses[0]?.emailAddress?.toLowerCase() || '';

  // 1. Check Environment Variable Overrides
  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase());
  const adminUserIds = (process.env.ADMIN_USER_IDS || '').split(',').map(id => id.trim());

  const isEnvAdmin = (userEmail && adminEmails.includes(userEmail)) || adminUserIds.includes(userId);

  // 2. Database Check
  try {
    let user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true, clerkId: true, email: true, role: true },
    });

    if (isEnvAdmin) {
      if (user && user.role !== 'admin') {
        // Auto-promote if identified by environment
        console.log(`[ADMIN_GUARD] Auto-promoting ${userEmail} to admin based on ENV`);
        user = await prisma.user.update({
          where: { id: user.id },
          data: { role: 'admin' },
          select: { id: true, clerkId: true, email: true, role: true },
        });
      }
      
      if (!user) {
        console.warn(`[ADMIN_GUARD] Env admin ${userEmail} not found in DB yet.`);
        return {
          id: 'env-override',
          clerkId: userId,
          email: userEmail,
          role: 'admin'
        } as AdminUser;
      }
    }

    if (!user || user.role !== 'admin') {
      console.warn(`[ADMIN_GUARD] Access denied for ${userEmail} (${userId}). Role: ${user?.role || 'none'}`);
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    return user as AdminUser;
  } catch (dbError) {
    console.error('[ADMIN_GUARD] Database Error:', dbError);
    
    // If DB is down but user is an ENV admin, let them in! This is critical for recovery.
    if (isEnvAdmin) {
      console.log(`[ADMIN_GUARD] DB Error but ENV override allowed for ${userEmail}`);
      return {
        id: 'db-fallback-admin',
        clerkId: userId,
        email: userEmail,
        role: 'admin'
      } as AdminUser;
    }
    
    return NextResponse.json({ error: 'Internal Server Error: Admin verification failed' }, { status: 500 });
  }
}
