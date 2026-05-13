import urllib.request
import re
import json

url = 'https://www.flipkart.com/gyan-soft-paneer/p/itm91ccfdd69f011?pid=PTFH6EVZ9WCYMEME&lid=LSTPTFH6EVZ9WCYMEMEAC8CYL&marketplace=HYPERLOCAL&shopId=luc_118_wh_hl_01'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'})
try:
    with urllib.request.urlopen(req) as response:
        html = response.read().decode('utf-8')
        print('Status:', response.status)
except Exception as e:
    print('Error:', e)
    html = ""

title2 = re.search(r'<title>(.*?)</title>', html)
print('Title tag:', title2.group(1) if title2 else 'Not found')

price_sym = re.search(r'₹[0-9,]+', html)
print('Any Price:', price_sym.group(0) if price_sym else 'Not found')

with open('debug_requests.html', 'w', encoding='utf-8') as f:
    f.write(html)
