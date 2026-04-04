import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
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
        // Rate limiting disabled per request - Always allowed

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
                    console.log(`[KRA-ID] KRA returned non-JSON response (${response.status}), body: ${rawText.substring(0, 500)}`);
                    throw new Error(`KRA returned non-JSON response (${response.status}): ${rawText.substring(0, 100)}`);
                }

                if (!response.ok || (data && (data.ErrorCode || data.errorMessage || data.ErrorMessage))) {
                    const errorBody = data?.ErrorMessage || data?.errorMessage || data?.error || data?.message || `KRA API error ${data?.ErrorCode || response.status}`;
                    // If error is 0 or "0", it's not an error (some APIs use ErrorCode: "0" for success)
                    if (data?.ErrorCode !== "0" && data?.ErrorCode !== 0) {
                        console.error(`[KRA-ID] API Error: ${errorBody}`, data);
                        return NextResponse.json({ errorMessage: errorBody, data }, { status: response.ok ? 400 : response.status });
                    }
                }

                console.log(`[KRA-ID] Success data keys: ${Object.keys(data).join(', ')}`);

                // Increment usage on success (best-effort)
                try { await incrementUsage('KRA'); } catch (e) { console.warn('[KRA-ID] incrementUsage failed:', e); }
                
                if (data && data.TaxpayerName) {
                    data.TaxpayerName = data.TaxpayerName.toUpperCase();
                }

                // Persistence: Save verification record to DB
                try {
                  const dbUser = await prisma.user.findUnique({
                    where: { clerkId: (await auth()).userId! },
                    select: { id: true }
                  });
                  if (dbUser) {
                    await prisma.verification.create({
                      data: {
                        userId: dbUser.id,
                        kraPin: data.TaxpayerPIN || 'UNKNOWN',
                        taxpayerName: data.TaxpayerName || 'UNKNOWN',
                        result: data
                      }
                    });
                  }
                } catch (saveErr) {
                  console.warn('[KRA-ID] Verification record creation failed:', saveErr);
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
