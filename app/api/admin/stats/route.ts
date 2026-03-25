import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-guard';

export async function GET() {
  const adminOrError = await requireAdmin();
  if (adminOrError instanceof NextResponse) return adminOrError;

  try {
    const [
      totalUsers,
      totalTransactions,
      totalVerifications,
      totalCertificates,
      revenueResult,
      recentUsers,
      activeSubscriptions,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.transaction.count(),
      prisma.verification.count(),
      prisma.certificate.count(),
      prisma.transaction.aggregate({
        _sum: { amount: true },
        where: { status: 'completed' },
      }),
      prisma.user.count({
        where: {
          createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
      }),
      prisma.user.count({
        where: { subscriptionStatus: 'active' },
      }),
    ]);

    return NextResponse.json({
      totalUsers,
      totalTransactions,
      totalVerifications,
      totalCertificates,
      totalRevenue: revenueResult._sum.amount || 0,
      recentUsers,
      activeSubscriptions,
    });
  } catch (error) {
    console.error('[Admin Stats]', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
