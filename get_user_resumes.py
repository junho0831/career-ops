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
    'Referer': 'https://www.wanted.co.kr/cv/list',
}

# The resumes API in wanted chaos:
res = requests.get('https://www.wanted.co.kr/api/chaos/resumes/v1', headers=headers)
print("Resumes API status:", res.status_code)
if res.status_code == 200:
    data = res.json()
    print("Resumes data:", json.dumps(data, indent=2, ensure_ascii=False))
else:
    # Try another endpoint
    res2 = requests.get('https://www.wanted.co.kr/api/v4/resumes', headers=headers)
    print("Resumes v4 status:", res2.status_code)
    if res2.status_code == 200:
        print("Resumes v4 data:", json.dumps(res2.json(), indent=2, ensure_ascii=False))
