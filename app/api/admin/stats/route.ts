import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-guard';
import { syncPaystackTransactions } from '@/lib/paystack-sync';

// Source: app/api/admin/stats/route.ts
// Purpose: Fetch synchronized stats from Paystack and local DB.

export async function GET() {
  let adminUser;
  try {
    const adminOrError = await requireAdmin();
    if (adminOrError instanceof NextResponse) {
        console.warn('[ADMIN_STATS] Unauthorized or Forbidden access attempt.');
        return adminOrError;
    }
    adminUser = adminOrError;
  } catch (guardErr) {
    console.error('[ADMIN_STATS] Guard Crash:', guardErr);
    return NextResponse.json({ error: 'Auth Verification System Failure' }, { status: 500 });
  }

  try {
    // 1. Sync Logic (Real-time pull from Paystack)
    // We wrap this separately so a Paystack network failure doesn't crash the whole dashboard
    try {
        await syncPaystackTransactions();
    } catch (syncErr) {
        console.error('[ADMIN_STATS] Paystack Sync Failed (non-fatal):', syncErr);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const last7Days = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30Days = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    // 2. Fetch data with extreme caution
    const [
      totalUsers,
      totalTransactions,
      totalVerifications,
      totalCertificates,
      revenueResult,
      recentUsersCount,
      activeSubscriptions,
      recentCertificates,
      supportPending,
      supportResolved,
      recentTransactionsData,
      recentMessagesData,
      dailyRevenues,
      dailyUsers
    ] = await Promise.all([
      prisma.user.count().catch(() => 0),
      prisma.transaction.count().catch(() => 0),
      prisma.verification.count().catch(() => 0),
      prisma.certificate.count().catch(() => 0),
      prisma.transaction.aggregate({
        _sum: { amount: true },
        where: { status: 'completed' },
      }).catch(() => ({ _sum: { amount: 0 } })),
      prisma.user.count({
        where: { createdAt: { gte: last7Days } },
      }).catch(() => 0),
      prisma.user.count({
        where: { subscriptionStatus: 'active' },
      }).catch(() => 0),
      prisma.certificate.count({
        where: { createdAt: { gte: last7Days } },
      }).catch(() => 0),
      prisma.contactMessage.count({ where: { status: 'pending' } }).catch(() => 0),
      prisma.contactMessage.count({ where: { status: 'resolved' } }).catch(() => 0),
      prisma.transaction.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { email: true, name: true } } }
      }).catch(() => []),
      prisma.contactMessage.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { email: true, name: true } } }
      }).catch(() => []),
      prisma.transaction.groupBy({
        by: ['createdAt'],
        _sum: { amount: true },
        where: { 
          status: 'completed',
          createdAt: { gte: last30Days }
        },
      }).catch(() => []),
      prisma.user.groupBy({
        by: ['createdAt'],
        _count: { id: true },
        where: { createdAt: { gte: last30Days } },
      }).catch(() => [])
    ]);

    // Trend calculation
    const dailyRevenueTrend = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today.getTime() - (6 - i) * 24 * 60 * 60 * 1000);
      const dateStr = d.toLocaleDateString('en-US', { weekday: 'short' });
      const rev = (dailyRevenues as any[]).filter(r => 
        new Date(r.createdAt).toDateString() === d.toDateString()
      ).reduce((acc, curr) => acc + (curr._sum.amount || 0), 0);
      return { date: dateStr, revenue: rev || 0 }; 
    });

    const dailyUserTrend = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today.getTime() - (6 - i) * 24 * 60 * 60 * 1000);
      const dateStr = d.toLocaleDateString('en-US', { weekday: 'short' });
      const count = (dailyUsers as any[]).filter(u => 
        new Date(u.createdAt).toDateString() === d.toDateString()
      ).reduce((acc, curr) => acc + curr._count.id, 0);
      return { date: dateStr, count: count }; 
    });

    const mappedTransactions = (recentTransactionsData as any[]).map(tx => ({
      id: tx.id,
      desc: `${tx.type.charAt(0).toUpperCase() + tx.type.slice(1)} Payment`,
      amount: `${(tx.amount / 100).toLocaleString()}`,
      type: tx.status === 'completed' ? 'credit' : 'debit',
      date: new Date(tx.createdAt).toLocaleDateString(),
      user: tx.user?.email || 'System'
    }));

    // Clarity Fallback
    const clarityData = {
      sessions: recentUsersCount || 1,
      activeUsers: recentUsersCount || 0,
      bounceRate: 15.5,
      avgDuration: '2m 14s'
    };

    const response = NextResponse.json({
      totalUsers,
      totalTransactions,
      totalRevenue: (revenueResult._sum.amount || 0),
      recentUsers: recentUsersCount,
      activeSubscriptions,
      dailyRevenueTrend,
      dailyUserTrend,
      supportStats: {
        open: supportPending,
        resolved: supportResolved,
        total: supportPending + supportResolved,
        recent: (recentMessagesData as any[]).map(m => ({
          id: m.id,
          user: m.user?.email || 'Anonymous',
          subject: m.subject,
          status: m.status,
          date: new Date(m.createdAt).toLocaleDateString()
        }))
      },
      recentTransactions: mappedTransactions,
      activeNow: clarityData.activeUsers || recentUsersCount || 0,
      status: 'operational'
    });

    // Enforce NO CACHING for admin stats
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;
  } catch (error) {
    console.error('[Admin Stats Intelligence Critical Failure]', error);
    return NextResponse.json({ 
        error: 'Failed to fetch advanced stats', 
        details: error instanceof Error ? error.message : 'Unknown technical error' 
    }, { status: 500 });
  }
}
