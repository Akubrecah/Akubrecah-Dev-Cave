import { NextResponse } from 'next/server';
import { getAccessToken } from '@/lib/kra-client';
import { checkUsageLimit, incrementUsage } from '@/lib/pdf/usage';

/**
 * KRA PIN Checker by ID API
 * Endpoint: POST /checker/v1/pin
 * 
 * TaxpayerType values:
 *   KE    - Kenyan Resident
 *   NKE   - Non-Kenyan Resident  
 *   NKENR - Non-Kenyan Non-Resident
 *   COMP  - Company / Non-Individual
 */
export async function POST(req: Request) {
    try {
        // Enforce daily usage limit (best-effort, don't block KRA on DB failure)
        try {
          const limit = await checkUsageLimit('KRA');
          if (!limit.allowed) {
            return NextResponse.json({ 
                errorMessage: 'Daily limit reached. Please upgrade to premium for unlimited verifications.',
                limitReached: true,
                count: limit.count 
            }, { status: 429 });
          }
        } catch (usageErr) {
          console.warn('[KRA-ID] Usage check failed, allowing request:', usageErr);
        }

        const { idType = 'KE', idNumber } = await req.json();
        const token = await getAccessToken('pinByID');
        const BASE_URL = process.env.KRA_API_BASE_URL || 'https://sbx.kra.go.ke';
        const endpoint = `${BASE_URL}/checker/v1/pin`;
        console.log(`[KRA-ID] Calling ${endpoint} with TaxpayerType=${idType}, TaxpayerID=${idNumber}`);

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
                        TaxpayerType: idType,
                        TaxpayerID: idNumber
                    }),
                    signal: controller.signal
                });

                clearTimeout(timeout);
                
                const rawText = await response.text();
                console.log(`[KRA-ID] Response status: ${response.status}, body: ${rawText.substring(0, 300)}`);

                let data;
                try {
                    data = JSON.parse(rawText);
                } catch {
                    throw new Error(`KRA returned non-JSON response (${response.status}): ${rawText.substring(0, 100)}`);
                }

                if (!response.ok) {
                    const errorBody = data?.ErrorMessage || data?.errorMessage || data?.error || data?.message || `KRA API error ${response.status}`;
                    return NextResponse.json({ errorMessage: errorBody }, { status: response.status });
                }

                // Increment usage on success (best-effort)
                try { await incrementUsage('KRA'); } catch (e) { console.warn('[KRA-ID] incrementUsage failed:', e); }
                
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
