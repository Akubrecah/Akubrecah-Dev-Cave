import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-guard';
import { rateLimit } from '@/lib/rate-limit';

// Use Node.js runtime to support crypto and prismatic dependencies
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const limited = rateLimit(req);
  if (limited) return limited;

  const adminOrError = await requireAdmin();
  if (adminOrError instanceof NextResponse) return adminOrError;

  try {
    const { messages } = await req.json();
    const apiKey = process.env.NVIDIA_API_KEY;

    if (!apiKey || apiKey.includes('XXXXXX')) {
      return NextResponse.json({ error: 'NVIDIA_API_KEY is not configured' }, { status: 500 });
    }

    // Fetch snapshot of dashboard stats for context
    const [totalUsers, totalTransactions, revenueResult, supportPending] = await Promise.all([
      prisma.user.count(),
      prisma.transaction.count(),
      prisma.transaction.aggregate({
        _sum: { amount: true },
        where: { status: 'completed' },
      }),
      prisma.contactMessage.count({ where: { status: 'pending' } }),
    ]);

    const stats = {
      totalUsers,
      premiumUsers: await prisma.user.count({ where: { subscriptionStatus: 'active' } }),
      totalRevenue: revenueResult._sum.amount || 0,
      activeSupportTickets: supportPending,
      totalSupportTickets: await prisma.contactMessage.count(),
      recentUsers: await prisma.user.count({ where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } }),
    };

    const conversionRate = ((stats.premiumUsers / (totalUsers || 1)) * 100).toFixed(1);
    const avgTransactionValue = (stats.totalRevenue / (totalTransactions || 1));

    const systemPrompt = `You are the Akubrecah Industrial Terminal Assistant. 
You provide administrative insights based on platform data.
The primary revenue engine is Paystack.
CURRENCY: All revenue is in Kenya Shillings (KES).
DATA NOTE: Revenue values are stored in SUBUNITS (cents/kobo) in the database for precision. 
IMPORTANT: When reporting revenue to the user, you MUST divide the stored value by 100 to get the actual KES amount.

Current Platform Context:
- Active Users: ${stats.totalUsers}
- Premium Users: ${stats.premiumUsers} (${conversionRate}%)
- Total Revenue: KES ${((stats.totalRevenue || 0) / 100).toLocaleString()}
- Average Transaction: KES ${((avgTransactionValue || 0) / 100).toLocaleString()}
- Tickets (Active/Total): ${stats.activeSupportTickets}/${stats.totalSupportTickets}
- Recent Growth (7d): +${stats.recentUsers} users

Be professional, concise, and analytical. Use table formatting for data comparisons.`;

    const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "meta/llama-3.1-70b-instruct",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages
        ],
        temperature: 0.2,
        max_tokens: 1024,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('NVIDIA AI Error:', errorText);
      return new Response(`AI endpoint error: ${response.status}`, { status: response.status });
    }

    // Stream the response back to the client
    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Dashboard Assistant Error:', error);
    return NextResponse.json({ error: 'Internal scaling failure' }, { status: 500 });
  }
}
