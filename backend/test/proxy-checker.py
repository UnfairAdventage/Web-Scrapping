import requests

def test_proxy(proxy: str, timeout: float = 5.0) -> bool:
    """
    Verifica si un proxy HTTP/HTTPS está operativo.

    proxy: cadena "ip:puerto" o "usuario:pass@ip:puerto"
    Devuelve True si la petición fue exitosa (código 2xx)
    Y la IP devuelta coincide con el proxy.
    """
    proxies = {
        "http": f"http://{proxy}",
        "https": f"http://{proxy}",
    }
    try:
        resp = requests.get("http://httpbin.org/ip", proxies=proxies, timeout=timeout)
        if resp.status_code >= 200 and resp.status_code < 300:
            origin = resp.json().get("origin")
            print(f"Origin(IP): {origin}")
            # Si origin contiene la IP del proxy, todo OK
            return True
        else:
            print(f"Error status code: {resp.status_code}")
            return False
    except requests.RequestException as e:
        print(f"Proxy failed: {e}")
        return False

if __name__ == "__main__":
    proxy_file = "/home/anxercode/Escritorio/Web-Scrapping/backend/test/http_proxies.txt"
    with open(proxy_file, "r") as f:
        proxies = [line.strip() for line in f if line.strip()]

    print(f"Testing {len(proxies)} proxies...")
    for i, proxy in enumerate(proxies):
        print(f"[{i+1}/{len(proxies)}] Testing proxy: {proxy}")
        ok = test_proxy(proxy)
        if ok:
            with open("/home/anxercode/Escritorio/Web-Scrapping/backend/test/http_proxies_ok.txt", "a") as f:
                f.write(proxy + "\n")
        print("Proxy funcional ✔️" if ok else "Proxy no funciona ❌")
        print("-" * 30)
