import dotenv from 'dotenv';
import path from 'path';

// Load .env from root BEFORE importing the client
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import { getAccessToken } from '../lib/kra-client';

async function verifyAuth() {
    console.log('--- KRA Auth Verification ---');
    console.log('Base URL:', process.env.KRA_API_BASE_URL);
    
    const apis = ['pinByID', 'pinByPIN', 'nilReturn'] as const;
    
    for (const api of apis) {
        console.log(`\nTesting ${api}...`);
        try {
            const token = await getAccessToken(api, 0); // No retries for test
            console.log(`✅ ${api}: Success! Token starts with: ${token.substring(0, 10)}...`);
        } catch (error) {
            console.error(`❌ ${api}: Failed!`);
            if (error instanceof Error) {
                console.error('Error message:', error.message);
            }
        }
    }
}

verifyAuth().catch(console.error);
