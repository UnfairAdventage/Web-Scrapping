import curl_cffi.requests as requests
import random
from itertools import cycle
import time

user_agents = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_4) AppleWebKit/605.1.15 Safari/605.1.15",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 16_3_1) AppleWebKit/605.1.15 Mobile Safari/604.1"
]
ua_cycle = cycle(user_agents)

proxy_list = [
    "181.129.147.163:8080",
    "8.243.67.190:8080",
    "179.60.53.25:999",
    "38.250.126.201:999",
    "181.78.75.202:999",
    "138.117.13.97:999",
    "181.111.164.210:999",
    "38.158.83.241:999",
    "181.174.164.221:80",
    "38.191.146.7:999"
]
proxy_pool = cycle(proxy_list)

def fetch(url):
    proxy = next(proxy_pool)
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36"
    }
    try:
        resp = requests.get(url, headers=headers, proxies={"http": proxy, "https": proxy}, timeout=20)
        resp.raise_for_status()
        return resp.text
    except requests.exceptions.RequestException as e:
        print(f"Error fetching {url} with proxy {proxy}: {e}")
        return None

print(fetch("https://example.com"))