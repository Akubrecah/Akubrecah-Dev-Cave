import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-guard';

export async function GET() {
  const adminOrError = await requireAdmin();
  if (adminOrError instanceof NextResponse) return adminOrError;

  try {
    // Generate dates for the last 7 days
    const dates = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - (6 - i));
      return d;
    });

    const results = await Promise.all(
      dates.map(async (date) => {
        const nextDay = new Date(date);
        nextDay.setDate(date.getDate() + 1);

        const [userCount, transactionCount, verificationCount, revenueResult] = await Promise.all([
          prisma.user.count({
            where: {
              createdAt: { gte: date, lt: nextDay },
            },
          }),
          prisma.transaction.count({
            where: {
              createdAt: { gte: date, lt: nextDay },
              status: 'completed',
            },
          }),
          prisma.verification.count({
            where: {
              createdAt: { gte: date, lt: nextDay },
            },
          }),
          prisma.transaction.aggregate({
            _sum: { amount: true },
            where: {
              createdAt: { gte: date, lt: nextDay },
              status: 'completed',
            },
          }),
        ]);

        // Analytics Logic: 
        // "Traffic" (Network) = Total significant actions (Verifications + Transactions)
        const absoluteTraffic = verificationCount + transactionCount;
        
        return {
          date: date.toISOString().split('T')[0],
          users: userCount,
          transactions: transactionCount,
          revenue: (revenueResult._sum.amount || 0) / 100,
          traffic: absoluteTraffic, 
          active_users: userCount + (verificationCount > 0 ? 1 : 0)
        };
      })
    );

    return NextResponse.json(results);
  } catch (error) {
    console.error('[Admin Time-Series]', error);
    return NextResponse.json({ error: 'Failed to fetch time-series data' }, { status: 500 });
  }
}
