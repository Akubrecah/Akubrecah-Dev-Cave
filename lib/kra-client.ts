const BASE_URL = (process.env.KRA_API_BASE_URL || 'https://sbx.kra.go.ke').replace(/\/+$/, '');

const KRA_CONFIG = {
    pinByID: {
        consumerKey: (process.env.KRA_ID_CONSUMER_KEY || '').trim(),
        consumerSecret: (process.env.KRA_ID_CONSUMER_SECRET || '').trim(),
        tokenEndpoint: `${BASE_URL}/v1/token/generate?grant_type=client_credentials`,
        pinCheckerEndpoint: `${BASE_URL}/checker/v1/pin`
    },
    pinByPIN: {
        consumerKey: (process.env.KRA_PIN_CONSUMER_KEY || '').trim(),
        consumerSecret: (process.env.KRA_PIN_CONSUMER_SECRET || '').trim(),
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

    if (!config.consumerKey || !config.consumerSecret) {
        throw new Error(`KRA Configuration Error: Missing credentials for ${apiType}. Please check your environment variables.`);
    }

    if (cache.token && now < cache.expiry) {
        console.log(`[AUTH] Using cached token for ${apiType}`);
        return cache.token;
    }

    const credentials = Buffer.from(`${config.consumerKey}:${config.consumerSecret}`).toString('base64');
    
    for (let i = 0; i <= retries; i++) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);

        // Try GET first (standard KRA), then POST (standard OAuth2)
        const methods: ('GET' | 'POST')[] = ['GET', 'POST'];
        
        for (const method of methods) {
            try {
                console.log(`[AUTH] Attempt ${i + 1} for ${apiType}: Fetching token from ${config.tokenEndpoint} using ${method}...`);
                
                const fetchOptions: RequestInit = {
                    method,
                    headers: { 
                        'Authorization': `Basic ${credentials}`,
                        'User-Agent': 'Mozilla/5.0 (Node.js/KRA-Checker)',
                        'Accept': 'application/json'
                    },
                    signal: controller.signal
                };

                // If POST, move query params to body if needed? 
                // Actually, most APIs allow query params with POST too.
                // But let's keep it simple first.

                const response = await fetch(config.tokenEndpoint, { ...fetchOptions });

                // If we get 405 Method Not Allowed or 400 (and we haven't tried POST yet), try the next method
                if ((response.status === 405 || response.status === 400) && method === 'GET') {
                    console.warn(`[AUTH] ${method} failed with ${response.status}. Retrying with POST...`);
                    continue; 
                }

                clearTimeout(timeout);

                const contentType = response.headers.get('content-type');
                if (!contentType || !contentType.includes('application/json')) {
                    const text = await response.text();
                    const errorMessage = `KRA Endpoint Verification Failed: Server returned ${response.status} ${response.statusText}. Content received: ${text.substring(0, 500)}`;
                    console.error(`[AUTH] ${errorMessage}`);
                    throw new Error(errorMessage);
                }

                const data = await response.json();
                if (!response.ok) throw new Error(data.errorMessage || `Auth failed with status ${response.status}`);

                cache.token = data.access_token;
                cache.expiry = now + parseInt(data.expires_in || '3600') - 60;
                console.log(`[AUTH] Token retrieved successfully for ${apiType}.`);
                return cache.token;
            } catch (error: unknown) {
                if (error instanceof Error && error.message.includes('Retrying with POST')) continue;
                
                clearTimeout(timeout);
                if (error instanceof Error) {
                    const isTimeout = error.name === 'AbortError';
                    console.error(`[AUTH] Attempt ${i + 1} for ${apiType} failed (${method}): ${isTimeout ? 'Request Timed Out' : error.message}`);
                }
                if (i === retries && method === 'POST') throw error;
            }
        }
        await new Promise(resolve => setTimeout(resolve, i * 1000 + 500));
    }
}
