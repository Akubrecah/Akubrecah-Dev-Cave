import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * Temporary endpoint to set admin role by email.
 * DELETE THIS FILE after setup is complete.
 */
export async function GET() {
  const ADMIN_EMAIL = 'poweldayck@gmail.com';

  try {
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: ADMIN_EMAIL },
    });

    if (!user) {
      return NextResponse.json({ 
        error: 'User not found',
        hint: 'Log in to the dashboard first so your user record gets created, then visit this endpoint again.'
      }, { status: 404 });
    }

    // Update role to admin
    const updated = await prisma.user.update({
      where: { email: ADMIN_EMAIL },
      data: { role: 'admin' },
      select: { id: true, email: true, role: true },
    });

    return NextResponse.json({ message: 'Admin role set successfully!', user: updated });
  } catch (error) {
    console.error('[Admin Setup]', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
