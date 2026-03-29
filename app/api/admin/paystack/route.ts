import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-guard';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

export async function POST(req: Request) {
  const adminOrError = await requireAdmin();
  if (adminOrError instanceof NextResponse) return adminOrError;

  try {
    const body = await req.json();
    const { action, params } = body;

    if (!PAYSTACK_SECRET_KEY) {
      return NextResponse.json({ error: 'Paystack Secret Key not configured' }, { status: 500 });
    }

    switch (action) {
      case 'verify':
        const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${params.reference}`, {
          headers: {
            Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
            'Content-Type': 'application/json',
          },
        });
        return NextResponse.json(await verifyRes.json());

      case 'list':
        const listRes = await fetch(`https://api.paystack.co/transaction?perPage=${params.perPage || 15}&page=${params.page || 1}`, {
          headers: {
            Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
            'Content-Type': 'application/json',
          },
        });
        return NextResponse.json(await listRes.json());

      case 'balance':
        const balanceRes = await fetch('https://api.paystack.co/balance', {
          headers: {
            Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
            'Content-Type': 'application/json',
          },
        });
        return NextResponse.json(await balanceRes.json());

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('[Paystack Admin API Error]', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
