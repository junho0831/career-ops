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
    'Referer': 'https://www.wanted.co.kr/status/applications',
    'wanted-user-id': '97672243-0e93-4d7d-890f-ea3507df4abe'
}

# Check application summary
res = requests.get('https://www.wanted.co.kr/api/chaos/applications/v1/summary', headers=headers)
print("Summary API HTTP status:", res.status_code)
print("Summary Response:", json.dumps(res.json(), indent=2, ensure_ascii=False))

# Check default resume
res2 = requests.get('https://www.wanted.co.kr/api/v1/resumes', headers=headers)
print("Resumes API HTTP status:", res2.status_code)
resumes = res2.json()
print("Resumes count:", len(resumes.get('data', [])))
for r in resumes.get('data', [])[:3]:
    print(f"  ID: {r.get('id')} | Title: {r.get('title')} | is_default: {r.get('is_default')}")
