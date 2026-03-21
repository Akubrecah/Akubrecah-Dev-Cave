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
    },
    nilReturn: {
        consumerKey: (process.env.KRA_NIL_CONSUMER_KEY || '').trim(),
        consumerSecret: (process.env.KRA_NIL_CONSUMER_SECRET || '').trim(),
        tokenEndpoint: `${BASE_URL}/v1/token/generate?grant_type=client_credentials`,
        nilReturnEndpoint: `${BASE_URL}/dtd/return/v1/nil`
    }
};

const tokenCache: {
  pinByID: { token: string | null; expiry: number };
  pinByPIN: { token: string | null; expiry: number };
  nilReturn: { token: string | null; expiry: number };
} = {
  pinByID: { token: null, expiry: 0 },
  pinByPIN: { token: null, expiry: 0 },
  nilReturn: { token: null, expiry: 0 }
};

export async function getAccessToken(apiType: 'pinByID' | 'pinByPIN' | 'nilReturn', retries = 2) {
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
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'application/json'
                };

                let body: string | undefined = undefined;
                let endpoint = config.tokenEndpoint;

                if (method === 'POST') {
                    headers['Content-Type'] = 'application/x-www-form-urlencoded';
                    
                    // KRA Production API (api.kra.go.ke) sometimes requires grant_type in the URL 
                    // even for POST requests. We'll try both by default or keep it in URL.
                    body = 'grant_type=client_credentials';
                    
                    // NEW: Try to keep the query parameters for the first attempt if it's production
                    const isProduction = endpoint.includes('api.kra.go.ke');
                    if (isProduction) {
                        console.log(`[AUTH] Production endpoint detected, keeping grant_type in URL for POST.`);
                    } else {
                        // For sandbox, we usually split it
                        endpoint = endpoint.split('?')[0];
                    }
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

                if (method === 'POST' && body && text.trim() === body.trim()) {
                    const echoError = `KRA Auth Failed: Server echoed request body back. This usually means the endpoint is misconfigured or a proxy is intercepting the request. URL: ${endpoint}`;
                    console.error(`[AUTH] ${echoError}`);
                    throw new Error(echoError);
                }

                if (!contentType || !contentType.includes('application/json')) {
                    // Check if it's HTML (often happens with error pages from proxies/WAFs)
                    const isHtml = text.trim().toLowerCase().startsWith('<!doctype') || text.trim().toLowerCase().startsWith('<html');
                    
                    const errorMessage = `KRA Auth Failed: Status ${response.status} ${response.statusText}, CT: ${contentType || 'missing'}, Len: ${contentLength || '0'}. ${isHtml ? 'Response is HTML (likely an error page).' : 'Content preview: ' + text.substring(0, 100)}`;
                    console.error(`[AUTH] ${errorMessage}`);
                    if (isHtml) {
                        console.debug(`[AUTH] HTML Title: ${text.match(/<title>(.*?)<\/title>/i)?.[1] || 'Unknown'}`);
                    }
                    console.debug(`[AUTH] Full response content: ${text}`);
                    console.debug(`[AUTH] Response headers: ${JSON.stringify(allHeaders)}`);

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

export type NilReturnData = {
    TaxpayerPIN: string;
    ObligationCode: string;
    Month: string;
    Year: string;
};

export async function fileNilReturn(data: NilReturnData) {
    const token = await getAccessToken('nilReturn');
    const endpoint = KRA_CONFIG.nilReturn.nilReturnEndpoint;

    console.log(`[NIL-RETURN] Filing Nil Return for PIN: ${data.TaxpayerPIN}...`);

    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            TAXPAYERDETAILS: data
        })
    });

    const text = await response.text();
    console.log(`[NIL-RETURN] Response Status: ${response.status}. Body: ${text.substring(0, 500)}`);

    let result;
    try {
        result = JSON.parse(text);
    } catch {
        throw new Error(`Failed to parse Nil Return response: ${text.substring(0, 100)}`);
    }

    // Handle KRA application-level errors (even on 200 OK)
    if (result.ErrorCode && result.ErrorCode !== "0" && result.ErrorCode !== 0) {
        throw new Error(result.ErrorMessage || `KRA Error ${result.ErrorCode}: File failed validation.`);
    }

    if (!response.ok) {
        throw new Error(result.RESPONSE?.Message || `Nil Return filing failed with status ${response.status}`);
    }

    return result;
}
