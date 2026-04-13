import urllib.request
import json
import base64

consumer_key = '4TKwD3C2IkHWWoO5VEoSgBda3zfbOLIGfwU6bkquNsq6d6q3'
consumer_secret = '5j03GirNnek3nA0Eel5WWpUNO779MIAR1rfzLTL9OxAcEEK5fm6QyzTrHK1i35kb'
creds = f"{consumer_key}:{consumer_secret}".encode('utf-8')
b64_creds = base64.b64encode(creds).decode('utf-8')

token_url = "https://api.kra.go.ke/v1/token/generate?grant_type=client_credentials"
token_req = urllib.request.Request(token_url, headers={'Authorization': f'Basic {b64_creds}'})

try:
    with urllib.request.urlopen(token_req) as response:
        token = json.loads(response.read().decode())['access_token']
except Exception as e:
    exit(1)

endpoint = "https://api.kra.go.ke/checker/v1/pinbypin"
payloads = [
    {"KRAPIN": "A002345678B"},
    {"PIN": "A002345678B"},
    {"pin": "A002345678B"},
    {"TaxpayerPIN": "A002345678B"}
]

for p in payloads:
    data = json.dumps(p).encode('utf-8')
    req = urllib.request.Request(endpoint, data=data, headers={
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    })
    try:
        with urllib.request.urlopen(req) as response:
            print(f"Success for {p}:", response.status, response.read().decode())
    except urllib.error.HTTPError as e:
        print(f"HTTP Error {e.code} for {p}: {e.read().decode()}")
    except Exception as e:
        print(f"Error for {p}: {e}")
