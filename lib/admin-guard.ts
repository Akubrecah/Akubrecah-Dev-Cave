import { auth } from '@clerk/nextjs/server';
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
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { id: true, clerkId: true, email: true, role: true },
  });

  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
  }

  return user as AdminUser;
}
