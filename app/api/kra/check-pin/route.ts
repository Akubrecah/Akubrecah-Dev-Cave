import { NextResponse } from 'next/server';
import { getAccessToken } from '@/lib/kra-client';

export async function POST(req: Request) {
    try {
        const { taxpayerType, taxpayerID } = await req.json();
        const token = await getAccessToken('pinByID');
        const BASE_URL = process.env.KRA_API_BASE_URL || 'https://sbx.kra.go.ke';
        const endpoint = `${BASE_URL}/checker/v1/pin`;

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
                        TaxpayerType: taxpayerType,
                        TaxpayerID: taxpayerID
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

                if (!response.ok) {
                    return NextResponse.json(data, { status: response.status });
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
