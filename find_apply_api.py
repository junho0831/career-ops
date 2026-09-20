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

# Try different API endpoints for apply form / pre-apply check
endpoints = [
    'https://www.wanted.co.kr/api/chaos/applications/v1/pre_apply/388097',
    'https://www.wanted.co.kr/api/v4/jobs/388097/application',
    'https://www.wanted.co.kr/api/chaos/jobs/v1/388097',
    'https://www.wanted.co.kr/api/chaos/applications/v1/applied/388097',
    'https://www.wanted.co.kr/api/v4/applications/pre_apply?job_id=388097'
]

for ep in endpoints:
    r = requests.get(ep, headers=headers)
    print(ep, "->", r.status_code)
    if r.status_code == 200:
        print("  Payload keys:", list(r.json().keys()))
