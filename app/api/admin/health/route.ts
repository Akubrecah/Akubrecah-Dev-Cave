import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-guard';

export async function GET() {
  const adminOrError = await requireAdmin();
  if (adminOrError instanceof NextResponse) return adminOrError;

  const startTime = Date.now();

  try {
    // 1. Database Check
    const dbCheck = await prisma.$queryRaw`SELECT 1`.then(() => 'up').catch(() => 'down');

    // 2. Clerk Auth Check (Fast ping to their API)
    const authCheck = await fetch('https://api.clerk.dev/v1/health', { 
      method: 'GET',
      headers: { 'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}` }
    }).then(r => r.ok ? 'up' : 'down').catch(() => 'down');

    // 3. Safaricom MPesa Check (Ping Sandbox Gateway)
    const mpesaCheck = await fetch('https://sandbox.safaricom.co.ke', { method: 'HEAD' })
      .then(r => r.status < 500 ? 'up' : 'down')
      .catch(() => 'down');

    // 4. KRA Gateway Check (Head to SBX)
    const kraCheck = await fetch('https://sbx.kra.go.ke', { method: 'HEAD' })
      .then(r => r.status < 500 ? 'up' : 'down')
      .catch(() => 'down');

    const duration = Date.now() - startTime;
    
    // Calculate overall health percentage
    const services = [dbCheck, authCheck, mpesaCheck, kraCheck];
    const upCount = services.filter(s => s === 'up').length;
    const healthScore = (upCount / services.length) * 100;

    return NextResponse.json({
      status: healthScore === 100 ? 'operational' : healthScore > 50 ? 'degraded' : 'down',
      score: healthScore,
      latency: duration,
      nodes: {
        database: dbCheck,
        auth: authCheck,
        payments: mpesaCheck,
        compliance: kraCheck
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[Admin Health Check Failed]', error);
    return NextResponse.json({ 
      status: 'down', 
      score: 0, 
      error: 'Diagnostics failed to run' 
    }, { status: 500 });
  }
}
