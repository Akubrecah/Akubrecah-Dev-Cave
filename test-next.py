import urllib.request
import json
import base64

endpoint = "http://localhost:3000/api/kra/check-pin-by-pin"
data = json.dumps({"pin": "A002345678B"}).encode('utf-8')

req = urllib.request.Request(endpoint, data=data, headers={
    'Content-Type': 'application/json'
})

try:
    with urllib.request.urlopen(req) as response:
        print("Success:", response.status, response.read().decode())
except urllib.error.HTTPError as e:
    print(f"HTTP Error {e.code}: {e.read().decode()}")
except Exception as e:
    print(f"Error: {e}")
