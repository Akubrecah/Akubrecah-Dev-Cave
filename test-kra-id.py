import urllib.request
import json
import base64

consumer_key = 'KDrns1DzJllANjGYLJiyJTPLPnAGjSLLTG5qkX6GqHaCmuRA'
consumer_secret = 'JYouvfOyVcKjefJPzHNss1BEclu9C3Mgn1LlBn8mDpYjKcGgGhfqqLL2QEUy5sni'
creds = f"{consumer_key}:{consumer_secret}".encode('utf-8')
b64_creds = base64.b64encode(creds).decode('utf-8')

token_url = "https://api.kra.go.ke/v1/token/generate?grant_type=client_credentials"
token_req = urllib.request.Request(token_url, headers={'Authorization': f'Basic {b64_creds}'})

try:
    with urllib.request.urlopen(token_req) as response:
        token = json.loads(response.read().decode())['access_token']
except Exception as e:
    exit(1)

endpoint = "https://api.kra.go.ke/checker/v1/pin"
data = json.dumps({"TaxpayerType": "KE", "TaxpayerID": "12345678"}).encode('utf-8')

req = urllib.request.Request(endpoint, data=data, headers={
    'Authorization': f'Bearer {token}',
    'Content-Type': 'application/json'
})

try:
    with urllib.request.urlopen(req) as response:
        print("Success:", response.status, response.read().decode())
except urllib.error.HTTPError as e:
    print(f"HTTP Error {e.code}: {e.read().decode()}")
except Exception as e:
    print(f"Error: {e}")
