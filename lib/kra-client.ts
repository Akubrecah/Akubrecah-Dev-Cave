const KRA_PROD_BASE = 'https://api.kra.go.ke';
const KRA_DEFAULT_SBX = 'https://sbx.kra.go.ke';

// Use a dedicated env var for Nil Return base, fallback to the general one or sandbox
const KRA_NIL_BASE = (process.env.KRA_NIL_API_BASE_URL || process.env.KRA_API_BASE_URL || KRA_DEFAULT_SBX).replace(/\/+$/, '');

const KRA_CONFIG = {
    pinByID: {
        consumerKey: (process.env.KRA_ID_CONSUMER_KEY || '').trim(),
        consumerSecret: (process.env.KRA_ID_CONSUMER_SECRET || '').trim(),
        tokenEndpoint: `${KRA_PROD_BASE}/v1/token/generate?grant_type=client_credentials`,
        pinCheckerEndpoint: `${KRA_PROD_BASE}/checker/v1/pin`
    },
    pinByPIN: {
        consumerKey: (process.env.KRA_PIN_CONSUMER_KEY || '').trim(),
        consumerSecret: (process.env.KRA_PIN_CONSUMER_SECRET || '').trim(),
        tokenEndpoint: `${KRA_PROD_BASE}/v1/token/generate?grant_type=client_credentials`,
        pinCheckerEndpoint: `${KRA_PROD_BASE}/checker/v1/pinbypin`
    },
    nilReturn: {
        consumerKey: (process.env.KRA_NIL_CONSUMER_KEY || '').trim(),
        consumerSecret: (process.env.KRA_NIL_CONSUMER_SECRET || '').trim(),
        tokenEndpoint: `${KRA_NIL_BASE}/v1/token/generate?grant_type=client_credentials`,
        nilReturnEndpoint: `${KRA_NIL_BASE}/dtd/return/v1/nil`
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
                    // HEURISTIC: api.kra.go.ke often echoes POST bodies, so we should avoid POST if it's production
                    // unless GET has definitively failed with a protocol error.
                    if (endpoint.includes('api.kra.go.ke')) {
                        console.warn(`[AUTH] Skipping POST fallback for production KRA endpoint as it is known to echo bodies instead of processing tokens.`);
                        continue; 
                    }

                    headers['Content-Type'] = 'application/x-www-form-urlencoded';
                    body = 'grant_type=client_credentials';
                    
                    // For sandbox, we usually split it (Standard OAuth2)
                    if (endpoint.includes('sbx.kra.go.ke')) {
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
                const text = await response.text();
                const isJson = contentType?.includes('application/json');

                // HEURISTIC: Check if server echoed the body back (happens with misconfigured KRA production/proxy endpoints)
                if (method === 'POST' && body && text.trim() === body.trim()) {
                    throw new Error(`KRA Auth Failed: Server echoed request body back. Status: ${response.status}, URL: ${endpoint}`);
                }

                if (!isJson) {
                    const isHtml = text.trim().toLowerCase().startsWith('<!doctype') || text.trim().toLowerCase().startsWith('<html');
                    const errorPreview = isHtml ? 'HTML Error' : text.substring(0, 100);
                    const errorMessage = `KRA Auth Failed: Status ${response.status}, CT: ${contentType || 'missing'}, Body: ${errorPreview}`;
                    
                    console.error(`[AUTH] Non-JSON response for ${apiType} (${method}): ${errorMessage}`);
                    
                    if (method === 'GET') {
                        console.warn(`[AUTH] Falling back to POST...`);
                        continue;
                    }
                    throw new Error(errorMessage);
                }

                const data = JSON.parse(text);
                if (!response.ok) {
                    const kraErrorMsg = data.errorMessage || data.message || `Auth failed with status ${response.status}`;
                    console.error(`[AUTH] KRA API reported error: ${kraErrorMsg}`);

                    // If we got a structured JSON error from KRA, then the endpoint reached the service.
                    // Credentials are likely wrong. No point in falling back to POST.
                    if (method === 'GET') {
                        throw new Error(`KRA API Error: ${kraErrorMsg}`);
                    }
                    throw new Error(kraErrorMsg);
                }

                cache.token = data.access_token;
                cache.expiry = now + parseInt(data.expires_in || '3600') - 60;
                console.log(`[AUTH] Token retrieved successfully for ${apiType} using ${method}.`);
                return cache.token;
            } catch (error: unknown) {
                clearTimeout(timeout);
                if (error instanceof Error) {
                    if (error.name === 'AbortError') {
                        console.error(`[AUTH] Attempt ${i + 1} for ${apiType} timed out.`);
                    } else if (error.message.startsWith('KRA API Error:')) {
                        throw error; // Propagate credential errors immediately
                    } else {
                        console.error(`[AUTH] Attempt ${i + 1} failed (${method}): ${error.message}`);
                    }
                    
                    if (i === retries && method === 'POST') throw error;
                    if (i === retries && method === 'GET' && apiType !== 'nilReturn') throw error; // Also throw for GET if it's the last attempt
                }
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
