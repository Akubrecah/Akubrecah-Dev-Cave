const BASE_URL = process.env.KRA_API_BASE_URL || 'https://sbx.kra.go.ke';

const KRA_CONFIG = {
    pinByID: {
        consumerKey: process.env.KRA_ID_CONSUMER_KEY!,
        consumerSecret: process.env.KRA_ID_CONSUMER_SECRET!,
        tokenEndpoint: `${BASE_URL}/v1/token/generate?grant_type=client_credentials`,
        pinCheckerEndpoint: `${BASE_URL}/checker/v1/pin`
    },
    pinByPIN: {
        consumerKey: process.env.KRA_PIN_CONSUMER_KEY!,
        consumerSecret: process.env.KRA_PIN_CONSUMER_SECRET!,
        tokenEndpoint: `${BASE_URL}/v1/token/generate?grant_type=client_credentials`,
        pinCheckerEndpoint: `${BASE_URL}/checker/v1/pinbypin`
    }
};

const tokenCache: {
  pinByID: { token: string | null; expiry: number };
  pinByPIN: { token: string | null; expiry: number };
} = {
  pinByID: { token: null, expiry: 0 },
  pinByPIN: { token: null, expiry: 0 }
};

export async function getAccessToken(apiType: 'pinByID' | 'pinByPIN', retries = 2) {
    const config = KRA_CONFIG[apiType];
    const cache = tokenCache[apiType];
    const now = Math.floor(Date.now() / 1000);

    if (cache.token && now < cache.expiry) {
        console.log(`[AUTH] Using cached token for ${apiType}`);
        return cache.token;
    }

    const credentials = Buffer.from(`${config.consumerKey}:${config.consumerSecret}`).toString('base64');
    
    for (let i = 0; i <= retries; i++) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);

        try {
            console.log(`[AUTH] Attempt ${i + 1} for ${apiType}: Fetching token from ${config.tokenEndpoint}...`);
            const response = await fetch(config.tokenEndpoint, {
                method: 'GET',
                headers: { 
                    'Authorization': `Basic ${credentials}`,
                    'User-Agent': 'Mozilla/5.0 (Node.js/KRA-Checker)',
                    'Accept': 'application/json'
                },
                signal: controller.signal
            });

            clearTimeout(timeout);

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                await response.text();
                throw new Error(`KRA Endpoint Verification Failed: Server returned ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            if (!response.ok) throw new Error(data.errorMessage || 'Auth failed');

            cache.token = data.access_token;
            cache.expiry = now + parseInt(data.expires_in) - 60;
            console.log(`[AUTH] Token retrieved successfully for ${apiType}.`);
            return cache.token;
        } catch (error: unknown) {
            clearTimeout(timeout);
            if (error instanceof Error) {
                const isTimeout = error.name === 'AbortError';
                console.error(`[AUTH] Attempt ${i + 1} for ${apiType} failed: ${isTimeout ? 'Request Timed Out' : error.message}`);
            }
            if (i === retries) throw error;
            await new Promise(resolve => setTimeout(resolve, i * 1000 + 500));
        }
    }
}
