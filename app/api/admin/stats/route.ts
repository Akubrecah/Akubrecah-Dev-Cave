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
      recentCertificates,
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
      prisma.certificate.count({
        where: {
          createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
      }),
    ]);

    // Fetch Paystack Totals
    let paystackRevenue = 0;
    try {
      const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
      if (paystackSecret) {
        const paystackRes = await fetch('https://api.paystack.co/transaction/totals', {
          headers: {
            'Authorization': `Bearer ${paystackSecret}`,
            'Content-Type': 'application/json'
          }
        });
        if (paystackRes.ok) {
          const paystackData = await paystackRes.json();
          // Paystack returns amounts in kobo (if NGN) or cents. 
          // For KES it's usually the full amount or cents. 
          // Assuming it matches the provided logic where /100 is used for display.
          paystackRevenue = paystackData.data.total_volume || 0;
        }
      }
    } catch (e) {
      console.error('[Admin Stats] Paystack fetch failed:', e);
    }

    const certTrend = totalCertificates > 0 
      ? Math.round((recentCertificates / totalCertificates) * 100) 
      : 0;

    const nextRefresh = new Date();
    nextRefresh.setHours(24, 0, 0, 0);

    return NextResponse.json({
      totalUsers,
      totalTransactions,
      totalVerifications,
      totalCertificates,
      totalRevenue: paystackRevenue || revenueResult._sum.amount || 0,
      recentUsers,
      activeSubscriptions,
      certTrend,
      nextRefresh: nextRefresh.toISOString(),
      // Adding a placeholder for GA data
      analyticsSource: 'Google Analytics 4',
      status: 'operational'
    });
  } catch (error) {
    console.error('[Admin Stats]', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
