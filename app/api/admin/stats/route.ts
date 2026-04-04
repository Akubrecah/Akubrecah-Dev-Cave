import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-guard';
import { syncPaystackTransactions } from '@/lib/paystack-sync';

// Source: app/api/admin/stats/route.ts
// Purpose: Fetch synchronized stats from Paystack and local DB.

export async function GET() {
  const adminOrError = await requireAdmin();
  if (adminOrError instanceof NextResponse) return adminOrError;

  try {
    // 1. Sync Logic (Real-time pull from Paystack)
    await syncPaystackTransactions();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const last7Days = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30Days = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      totalTransactions,
      totalVerifications,
      totalCertificates,
      revenueResult,
      recentUsers,
      activeSubscriptions,
      recentCertificates,
      supportPending,
      supportResolved,
      recentTransactionsData,
      recentMessagesData,
      dailyRevenues,
      dailyUsers
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
        where: { createdAt: { gte: last7Days } },
      }),
      prisma.user.count({
        where: { subscriptionStatus: 'active' },
      }),
      prisma.certificate.count({
        where: { createdAt: { gte: last7Days } },
      }),
      prisma.contactMessage.count({ where: { status: 'pending' } }),
      prisma.contactMessage.count({ where: { status: 'resolved' } }),
      prisma.transaction.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { email: true, name: true } } }
      }),
      prisma.contactMessage.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { email: true, name: true } } }
      }),
      prisma.transaction.groupBy({
        by: ['createdAt'],
        _sum: { amount: true },
        where: { 
          status: 'completed',
          createdAt: { gte: last30Days }
        },
      }),
      prisma.user.groupBy({
        by: ['createdAt'],
        _count: { id: true },
        where: { createdAt: { gte: last30Days } },
      })
    ]);

    // Trend calculation
    const dailyRevenueTrend = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today.getTime() - (6 - i) * 24 * 60 * 60 * 1000);
      const dateStr = d.toLocaleDateString('en-US', { weekday: 'short' });
      const rev = dailyRevenues.filter(r => 
        new Date(r.createdAt).toDateString() === d.toDateString()
      ).reduce((acc, curr) => acc + (curr._sum.amount || 0), 0);
      return { date: dateStr, revenue: rev || 0 }; 
    });

    const dailyUserTrend = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today.getTime() - (6 - i) * 24 * 60 * 60 * 1000);
      const dateStr = d.toLocaleDateString('en-US', { weekday: 'short' });
      const count = dailyUsers.filter(u => 
        new Date(u.createdAt).toDateString() === d.toDateString()
      ).reduce((acc, curr) => acc + curr._count.id, 0);
      return { date: dateStr, count: count }; 
    });

    const mappedTransactions = recentTransactionsData.map(tx => ({
      id: tx.id,
      desc: `${tx.type.charAt(0).toUpperCase() + tx.type.slice(1)} Payment`,
      amount: `${(tx.amount / 100).toLocaleString()}`,
      type: tx.status === 'completed' ? 'credit' : 'debit',
      date: new Date(tx.createdAt).toLocaleDateString(),
      user: tx.user?.email || 'System'
    }));

    // Clarity Fallback
    const clarityData = {
      sessions: recentUsers || 1,
      activeUsers: recentUsers || 0,
      bounceRate: 15.5,
      avgDuration: '2m 14s'
    };

    return NextResponse.json({
      totalUsers,
      totalTransactions,
      totalRevenue: (revenueResult._sum.amount || 0),
      recentUsers,
      activeSubscriptions,
      dailyRevenueTrend,
      dailyUserTrend,
      supportStats: {
        open: supportPending,
        resolved: supportResolved,
        total: supportPending + supportResolved,
        recent: recentMessagesData.map(m => ({
          id: m.id,
          user: m.user?.email || 'Anonymous',
          subject: m.subject,
          status: m.status,
          date: new Date(m.createdAt).toLocaleDateString()
        }))
      },
      recentTransactions: mappedTransactions,
      activeNow: clarityData.activeUsers || recentUsers || 0,
      status: 'operational'
    });
  } catch (error) {
    console.error('[Admin Stats Intelligence]', error);
    return NextResponse.json({ error: 'Failed to fetch advanced stats' }, { status: 500 });
  }
}
