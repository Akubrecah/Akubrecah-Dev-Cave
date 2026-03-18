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
                
                const headers: Record<string, string> = { 
                    'Authorization': `Basic ${credentials}`,
                    'User-Agent': 'Mozilla/5.0 (Node.js/KRA-Checker)',
                    'Accept': 'application/json'
                };

                let body: string | undefined = undefined;
                let endpoint = config.tokenEndpoint;

                if (method === 'POST') {
                    headers['Content-Type'] = 'application/x-www-form-urlencoded';
                    // Some APIs prefer grant_type in the body for POST
                    body = 'grant_type=client_credentials';
                    // Remove query params from endpoint if they are in the body
                    endpoint = endpoint.split('?')[0];
                }

                const response = await fetch(endpoint, {
                    method,
                    headers,
                    body,
                    signal: controller.signal
                });

                const contentType = response.headers.get('content-type');
                const allHeaders = Object.fromEntries(response.headers.entries());
                const contentLength = response.headers.get('content-length');
                // Remove sensitive headers if any
                delete allHeaders['set-cookie'];

                const text = await response.text();

                // If we get 200 OK but empty body, and we're on GET, try POST
                if (response.status === 200 && (!text || text.trim().length === 0) && method === 'GET') {
                    console.warn(`[AUTH] GET returned 200 OK but empty body. Retrying with POST...`);
                    continue;
                }

                if (!contentType || !contentType.includes('application/json')) {
                    const errorMessage = `KRA Auth Failed: Status ${response.status} ${response.statusText}, CT: ${contentType || 'missing'}, Len: ${contentLength || '0'}. Content: ${text.substring(0, 200)}`;
                    console.error(`[AUTH] ${errorMessage}`);

                    // If it's 200, maybe we can still try to parse it if it looks like JSON?
                    if (response.status === 200 && text.trim().startsWith('{')) {
                        try {
                            const data = JSON.parse(text);
                            cache.token = data.access_token;
                            cache.expiry = now + parseInt(data.expires_in || '3600') - 60;
                            console.log(`[AUTH] Token retrieved (ignoring context-type) for ${apiType}.`);
                            return cache.token;
                        } catch {
                            console.error(`[AUTH] Failed to parse despite starting with {`);
                        }
                    }
                    
                    if (method === 'GET') continue; // Try POST
                    throw new Error(errorMessage);
                }

                const data = JSON.parse(text);
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
