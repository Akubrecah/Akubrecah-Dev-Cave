const https = require('https');
require('dotenv').config({ path: '.env' });

function request(url, options, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function test() {
    try {
        const pinType = 'pinByPIN';
        const consumerKey = process.env.KRA_PIN_CONSUMER_KEY;
        const consumerSecret = process.env.KRA_PIN_CONSUMER_SECRET;
        const tokenEndpoint = "https://api.kra.go.ke/v1/token/generate?grant_type=client_credentials";

        console.log("Fetching token...");
        const credentials = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
        const tokenRes = await request(tokenEndpoint, {
            method: 'GET',
            headers: {
                'Authorization': `Basic ${credentials}`,
            }
        });
        const tokenData = JSON.parse(tokenRes.data);
        console.log("Token response:", tokenData);

        const token = tokenData.access_token;
        const endpoint = `https://api.kra.go.ke/checker/v1/pinbypin`;
        const pin = 'A002345678B';
        
        console.log(`Calling ${endpoint} with KRAPIN=${pin}`);
        const body = JSON.stringify({ KRAPIN: pin });
        const res = await request(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'User-Agent': 'Mozilla/5.0'
            }
        }, body);
        
        console.log("Response:", res.status, res.data);
    } catch (e) {
        console.error(e);
    }
}
test();
