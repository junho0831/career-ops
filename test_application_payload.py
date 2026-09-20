import json, requests

with open('data/cache/wanted_cookies.json') as f:
    cookies = json.load(f)

cookie_str = "; ".join([f"{c['name']}={c['value']}" for c in cookies if 'wanted.co.kr' in c.get('domain', '')])
token = next(c['value'] for c in cookies if c['name'] == 'WWW_ONEID_ACCESS_TOKEN')

headers = {
    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/plain, */*',
    'Cookie': cookie_str,
    'Authorization': f'Bearer {token}',
    'Referer': 'https://www.wanted.co.kr/wd/388097',
}

# Check application status or form for position 388097
# Get application info / check if already applied
res = requests.get('https://www.wanted.co.kr/api/chaos/applications/v1/jobs/388097', headers=headers)
print("Job 388097 check status:", res.status_code)
if res.status_code == 200:
    print("Response:", json.dumps(res.json(), indent=2, ensure_ascii=False))
else:
    print("Response text:", res.text[:200])

