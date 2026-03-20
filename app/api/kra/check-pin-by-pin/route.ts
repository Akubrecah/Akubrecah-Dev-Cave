import { NextResponse } from 'next/server';
import { getAccessToken } from '@/lib/kra-client';
import { checkUsageLimit, incrementUsage } from '@/lib/pdf/usage';

export async function POST(req: Request) {
    try {
        const { pin } = await req.json();

        // Enforcement: Check daily limit (best-effort, don't block KRA on DB failure)
        try {
          const { allowed, remaining } = await checkUsageLimit('KRA');
          if (!allowed) {
            return NextResponse.json({ 
                errorMessage: 'Daily limit reached. Please upgrade to Cyber Pro for unlimited verifications.',
                remaining 
            }, { status: 429 });
          }
        } catch (usageErr) {
          console.warn('[KRA-PIN] Usage check failed, allowing request:', usageErr);
        }

        const token = await getAccessToken('pinByPIN');
        const BASE_URL = process.env.KRA_API_BASE_URL || 'https://sbx.kra.go.ke';
        const endpoint = `${BASE_URL}/checker/v1/pinbypin`;
        console.log(`[KRA-PIN] Calling ${endpoint} with KRAPIN=${pin}`);

        for (let i = 0; i <= 2; i++) {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 15000);

            try {
                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                        'User-Agent': 'Mozilla/5.0 (Node.js/KRA-Checker)',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        KRAPIN: pin
                    }),
                    signal: controller.signal
                });

                clearTimeout(timeout);
                
                const rawText = await response.text();
                let data;
                try {
                    data = JSON.parse(rawText);
                } catch {
                    throw new Error('Invalid JSON response from KRA');
                }

                console.log(`[KRA-PIN] Response status: ${response.status}, body: ${rawText.substring(0, 500)}`);

                if (!response.ok) {
                    const errorBody = data?.errorMessage || data?.ErrorMessage || data?.error || data?.message || `KRA API error ${response.status}`;
                    console.error(`[KRA-PIN] API Error: ${errorBody}`, data);
                    return NextResponse.json({ errorMessage: errorBody }, { status: response.status });
                }

                console.log(`[KRA-PIN] Success data keys: ${Object.keys(data).join(', ')}`);

                // Increment usage upon success (best-effort)
                try { await incrementUsage('KRA'); } catch (e) { console.warn('[KRA-PIN] incrementUsage failed:', e); }

                if (data && data.TaxpayerName) {
                    data.TaxpayerName = data.TaxpayerName.toUpperCase();
                }

                return NextResponse.json(data);
            } catch (error: unknown) {
                clearTimeout(timeout);
                if (error instanceof Error) {
                    if (i === 2) throw error;
                } else {
                    if (i === 2) throw new Error('Unknown error');
                }
                await new Promise(resolve => setTimeout(resolve, i * 1000 + 500));
            }
        }
    } catch (error: unknown) {
        if (error instanceof Error) {
            return NextResponse.json({ errorMessage: error.message }, { status: 500 });
        }
        return NextResponse.json({ errorMessage: 'Unknown error occurred' }, { status: 500 });
    }
}
