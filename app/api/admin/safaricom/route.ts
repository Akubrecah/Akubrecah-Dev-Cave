import { NextResponse } from 'next/server';
import { safaricom } from '@/lib/safaricom';
import { requireAdmin } from '@/lib/admin-guard';

export async function POST(req: Request) {
  const adminOrError = await requireAdmin();
  if (adminOrError instanceof NextResponse) return adminOrError;

  try {
    const body = await req.json();
    const { action, params } = body;

    switch (action) {
      case 'stkpush':
        const stkData = await safaricom.stkPush(params);
        return NextResponse.json(stkData);
      
      case 'query_status':
        const queryData = await safaricom.queryTransactionStatus(params.checkoutRequestId);
        return NextResponse.json(queryData);
      
      case 'balance':
        const balanceData = await safaricom.getAccountBalance(params.initiator, params.securityCredential);
        return NextResponse.json(balanceData);
      
      case 'activate_sim':
        const simData = await safaricom.activateSIM(params.msisdn, params.vpnGroup, params.username);
        return NextResponse.json(simData);

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('[Safaricom API Error]', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

// Callback route (public)
export async function GET() {
  return NextResponse.json({ message: 'Safaricom Callback Endpoint Active' });
}
