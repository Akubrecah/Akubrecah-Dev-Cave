import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import { getAccessToken } from '@/lib/kra-client';
import { incrementUsage } from '@/lib/pdf/usage';
import { rateLimit } from '@/lib/rate-limit';

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
export async function POST(req: NextRequest) {
    const limited = rateLimit(req);
    if (limited) return limited;

    try {
        const { idType = 'KE', idNumber } = await req.json();
        const token = await getAccessToken('pinByID');
        const BASE_URL = process.env.KRA_API_BASE_URL || 'https://api.kra.go.ke';
        const endpoint = `${BASE_URL}/checker/v1/pin`;
        console.log(`[KRA-ID] Calling ${endpoint} with TaxpayerType=${idType}, TaxpayerID=${idNumber}`);

        for (let i = 0; i <= 1; i++) {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 7000);

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
                
                // Normalization: KRA APIs sometimes nest data inside 'Data', 'Result', or 'TaxpayerDetails'
                let normalizedData = data;
                const commonWrappers = ['Data', 'Result', 'TaxpayerDetails', 'TaxpayerDetailsResponse'];
                for (const wrapper of commonWrappers) {
                  if (data[wrapper] && typeof data[wrapper] === 'object' && !Array.isArray(data[wrapper])) {
                    normalizedData = { ...data, ...data[wrapper] };
                    console.log(`[KRA-ID] Normalized data from wrapper: ${wrapper}`);
                    break;
                  } else if (Array.isArray(data[wrapper]) && data[wrapper].length > 0) {
                    normalizedData = { ...data, ...data[wrapper][0] };
                    console.log(`[KRA-ID] Normalized data from array wrapper: ${wrapper}`);
                    break;
                  }
                }

                if (normalizedData && normalizedData.TaxpayerName) {
                    normalizedData.TaxpayerName = normalizedData.TaxpayerName.toUpperCase();
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
                        kraPin: normalizedData.TaxpayerPIN || normalizedData.KRAPIN || 'UNKNOWN',
                        taxpayerName: normalizedData.TaxpayerName || 'UNKNOWN',
                        result: normalizedData
                      }
                    });
                  }
                } catch (saveErr) {
                  console.warn('[KRA-ID] Verification record creation failed:', saveErr);
                }
                
                return NextResponse.json(normalizedData);
            } catch (error: unknown) {
                clearTimeout(timeout);
                if (error instanceof Error) {
                    if (i === 1) throw error;
                } else {
                    if (i === 1) throw new Error('Unknown error');
                }
                await new Promise(resolve => setTimeout(resolve, 300));
            }
        }
    } catch (error: unknown) {
        if (error instanceof Error) {
            return NextResponse.json({ errorMessage: error.message }, { status: 500 });
        }
        return NextResponse.json({ errorMessage: 'Unknown error occurred' }, { status: 500 });
    }
}
