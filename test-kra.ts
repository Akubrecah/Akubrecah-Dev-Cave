import dotenv from 'dotenv';
import { getAccessToken } from './lib/kra-client';

dotenv.config({ path: '.env' });

async function test() {
    try {
        const pin = 'A002345678B';
        const token = await getAccessToken('pinByPIN');
        const BASE_URL = process.env.KRA_API_BASE_URL || 'https://sbx.kra.go.ke';
        const endpoint = `${BASE_URL}/checker/v1/pinbypin`;
        console.log(`[KRA-PIN] Calling ${endpoint} with KRAPIN=${pin}`);

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
            })
        });

        const rawText = await response.text();
        console.log("Response:", response.status, rawText);
    } catch (e) {
        console.error(e);
    }
}
test();
