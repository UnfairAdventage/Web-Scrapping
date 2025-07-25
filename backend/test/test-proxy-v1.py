from stealth_requests import StealthSession

# Lista de proxies en formato "ip:puerto"
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
from itertools import cycle
proxy_pool = cycle(proxy_list)

from curl_cffi.requests.exceptions import RequestsError

def fetch(url):
    proxy = next(proxy_pool)  # rota proxies en cada solicitud
    try:
        with StealthSession() as session:
            resp = session.get(
                url,
                proxies={"http": proxy, "https": proxy},
                retry=3  # reintenta automáticamente si hay errores 429/503
            )
            resp.raise_for_status()  # Raise HTTPError for bad responses (4xx or 5xx)
            return resp.text
    except RequestsError as e:
        print(f"Error fetching {url} with proxy {proxy}: {e}")
        return None
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return None

if __name__ == "__main__":
    html = fetch("https://example.com")
    print(html[:500])