import { NextResponse } from 'next/server';
import { getAccessToken } from '@/lib/kra-client';

// Temporary debug endpoint - remove before production
export async function GET() {
    const BASE_URL = process.env.KRA_API_BASE_URL || 'https://sbx.kra.go.ke';
    const results: Record<string, unknown> = {
        baseUrl: BASE_URL,
        timestamp: new Date().toISOString(),
    };

    // Test PIN auth token
    try {
        const pinToken = await getAccessToken('pinByPIN');
        results.pinByPINToken = pinToken ? `${String(pinToken).substring(0, 20)}...` : 'null';
    } catch (e) {
        results.pinByPINTokenError = e instanceof Error ? e.message : String(e);
    }

    // Test ID auth token
    try {
        const idToken = await getAccessToken('pinByID');
        results.pinByIDToken = idToken ? `${String(idToken).substring(0, 20)}...` : 'null';
    } catch (e) {
        results.pinByIDTokenError = e instanceof Error ? e.message : String(e);
    }

    // Test the pinbypin endpoint with a sample PIN
    try {
        const token = await getAccessToken('pinByPIN');
        const endpoint = `${BASE_URL}/checker/v1/pinbypin`;
        const res = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            },
            body: JSON.stringify({ KRAPIN: 'A000111222B' })
        });
        const text = await res.text();
        results.pinByPINTest = {
            status: res.status,
            statusText: res.statusText,
            headers: Object.fromEntries(res.headers.entries()),
            body: text.substring(0, 500)
        };
    } catch (e) {
        results.pinByPINTestError = e instanceof Error ? e.message : String(e);
    }

    // Test pin-by-id against BOTH endpoints
    try {
        const token = await getAccessToken('pinByID');
        
        // A: Prod with JSON
        const resA = await fetch('https://api.kra.go.ke/checker/v1/pin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
            body: JSON.stringify({ TaxpayerType: 'Individual', TaxpayerID: '12345678' })
        });
        const textA = await resA.text();

        // B: Sandbox with JSON
        const resB = await fetch('https://sbx.kra.go.ke/checker/v1/pin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
            body: JSON.stringify({ TaxpayerType: 'Individual', TaxpayerID: '12345678' })
        });
        const textB = await resB.text();

        results.pinByIDTest = {
            prod_json: { status: resA.status, body: textA.substring(0, 400) },
            sandbox_json: { status: resB.status, body: textB.substring(0, 400) }
        };
    } catch (e) {
        results.pinByIDTestError = e instanceof Error ? e.message : String(e);
    }

    return NextResponse.json(results);
}
