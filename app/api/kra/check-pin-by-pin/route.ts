import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import { getAccessToken } from '@/lib/kra-client';
import { incrementUsage } from '@/lib/pdf/usage';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
    const limited = rateLimit(req);
    if (limited) return limited;

    try {
        const { pin } = await req.json();

        const token = await getAccessToken('pinByPIN');
        const BASE_URL = process.env.KRA_API_BASE_URL || 'https://api.kra.go.ke';
        const endpoint = `${BASE_URL}/checker/v1/pinbypin`;
        console.log(`[KRA-PIN] Calling ${endpoint} with KRAPIN=${pin}`);

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

                if (!response.ok || (data && (data.ErrorCode || data.errorMessage || data.ErrorMessage))) {
                    const errorDetail = data?.errorMessage || data?.ErrorMessage || data?.error || data?.message;
                    const errorCode = data?.ErrorCode || response.status;
                    
                    // If error is 0 or "0", it's not an error (some APIs use ErrorCode: "0" for success)
                    if (errorCode !== "0" && errorCode !== 0) {
                        const errorBody = errorDetail || `KRA API error ${errorCode}`;
                        console.error(`[KRA-PIN] API Error: ${errorBody}`, data);
                        return NextResponse.json({ 
                            errorMessage: errorBody, 
                            errorCode,
                            data 
                        }, { status: response.ok ? 400 : response.status });
                    }
                }

                console.log(`[KRA-PIN] Success data keys: ${Object.keys(data).join(', ')}`);

                // Increment usage upon success (best-effort)
                try { await incrementUsage('KRA'); } catch (e) { console.warn('[KRA-PIN] incrementUsage failed:', e); }

                // Normalization: KRA APIs sometimes nest data inside 'Data', 'Result', or 'TaxpayerDetails'
                let normalizedData = data;
                const commonWrappers = ['Data', 'Result', 'TaxpayerDetails', 'TaxpayerDetailsResponse'];
                for (const wrapper of commonWrappers) {
                  if (data[wrapper] && typeof data[wrapper] === 'object' && !Array.isArray(data[wrapper])) {
                    normalizedData = { ...data, ...data[wrapper] };
                    console.log(`[KRA-PIN] Normalized data from wrapper: ${wrapper}`);
                    break;
                  } else if (Array.isArray(data[wrapper]) && data[wrapper].length > 0) {
                    normalizedData = { ...data, ...data[wrapper][0] };
                    console.log(`[KRA-PIN] Normalized data from array wrapper: ${wrapper}`);
                    break;
                  }
                }

                // Check if we actually found a name
                if (!normalizedData.TaxpayerName && !normalizedData.KRAPIN && !normalizedData.TaxpayerPIN) {
                    console.warn('[KRA-PIN] API returned success but no recognizable taxpayer data was found.', data);
                    return NextResponse.json({ 
                        errorMessage: "Taxpayer details not found in API response.",
                        data 
                    }, { status: 404 });
                }

                if (normalizedData && normalizedData.TaxpayerName) {
                    normalizedData.TaxpayerName = normalizedData.TaxpayerName.toUpperCase();
                }

                // Persistence: Save verification record to DB (Defensive)
                try {
                  const authData = await auth().catch(() => null);
                  const userId = authData?.userId;
                  
                  if (userId) {
                    const dbUser = await prisma.user.findUnique({
                      where: { clerkId: userId },
                      select: { id: true }
                    }).catch(() => null);

                    if (dbUser) {
                      await prisma.verification.create({
                        data: {
                          userId: dbUser.id,
                          kraPin: normalizedData.KRAPIN || normalizedData.TaxpayerPIN || pin || 'UNKNOWN',
                          taxpayerName: normalizedData.TaxpayerName || 'UNKNOWN',
                          result: normalizedData
                        }
                      }).catch(e => console.warn('[KRA-PIN] Verification create failed:', e));
                    }
                  }
                } catch (persistErr) {
                  console.warn('[KRA-PIN] General persistence failure:', persistErr);
                }

                return NextResponse.json(normalizedData);
            } catch (error: unknown) {
                clearTimeout(timeout);
                const errorMsg = error instanceof Error ? error.message : 'Unknown fetch error';
                console.error(`[KRA-PIN] Fetch attempt ${i + 1} failed: ${errorMsg}`);
                if (i === 1) throw error;
                await new Promise(resolve => setTimeout(resolve, 300));
            }
        }
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
        console.error(`[KRA-PIN] Final Endpoint Error: ${errorMsg}`);
        
        return NextResponse.json({ 
            errorMessage: errorMsg,
            details: error instanceof Error ? error.stack?.substring(0, 100) : undefined,
            type: 'SERVER_ERROR'
        }, { status: 500 });
    }
}


