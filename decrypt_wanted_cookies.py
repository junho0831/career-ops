import sqlite3, os, hashlib, json
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes

with open('/tmp/chrome_safe_storage_key.bin', 'rb') as f:
    raw_key = f.read()

salt = b'saltysalt'
derived = hashlib.pbkdf2_hmac('sha1', raw_key, salt, 1, 16)

import shutil
shutil.copyfile('/home/junho/.config/google-chrome/Default/Cookies', '/tmp/fresh_cookies.db')
conn = sqlite3.connect('/tmp/fresh_cookies.db')
cur = conn.cursor()

cur.execute("SELECT host_key, name, value, encrypted_value FROM cookies WHERE host_key LIKE '%wanted.co.kr%'")
cookie_jar = {}

for host, name, val, enc_val in cur.fetchall():
    if val:
        cookie_jar[name] = val
    elif enc_val:
        if enc_val[:3] in (b'v10', b'v11'):
            enc_payload = enc_val[3:]
            iv = b' ' * 16
            cipher = Cipher(algorithms.AES(derived), modes.CBC(iv))
            decryptor = cipher.decryptor()
            dec = decryptor.update(enc_payload) + decryptor.finalize()
            pad = dec[-1]
            dec_text = dec[:-pad].decode('utf-8', errors='ignore')
            cookie_jar[name] = dec_text

conn.close()

print(f"Decrypted {len(cookie_jar)} Wanted cookies successfully!")
print("WWW_ONEID_ACCESS_TOKEN exists:", 'WWW_ONEID_ACCESS_TOKEN' in cookie_jar)
if 'WWW_ONEID_ACCESS_TOKEN' in cookie_jar:
    token = cookie_jar['WWW_ONEID_ACCESS_TOKEN']
    print(f"Token preview: {token[:15]}...{token[-10:]}")

# Save cookie jar to local cache
os.makedirs('data/cache', exist_ok=True)
with open('data/cache/wanted_cookies.json', 'w') as f:
    json.dump(cookie_jar, f, indent=2)

print("Saved to data/cache/wanted_cookies.json!")
