import requests
import time
import random
from config import get_random_headers, get_random_header_search
from bs4 import BeautifulSoup

def fetch_html(url, headers=None):
    """
    Obtiene HTML de una URL usando múltiples estrategias para superar protecciones.
    
    Args:
        url: URL a obtener
        headers: Headers personalizados (opcional). Si no se proporciona, usa headers aleatorios.
    """
    if headers is None:
        headers = get_random_headers()
    print(headers)
    try:
        import curl_cffi.requests as curl_requests
        headers_curl = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
            'Referer': 'https://www.google.com/',
        }
        
        # Probar con diferentes impersonaciones
        for browser in ['chrome120', 'chrome119', 'safari17']:
            try:
                response = curl_requests.get(url, headers=headers_curl, timeout=30, impersonate=browser)
                if response.status_code == 200:
                    print(f"[SUCCESS] Éxito con curl-cffi usando {browser}")
                    return response.text
            except Exception as e:
                print(f"[INFO] curl-cffi con {browser} falló: {e}")
                continue
    except ImportError:
        print("[INFO] curl-cffi no disponible")
    except Exception as e:
        print(f"[INFO] Error con curl-cffi: {e}")
    
    print(f"[ERROR] Todas las estrategias fallaron para {url}")
    return None

def fetch_html_with_headers(url, headers):
    """
    Obtiene HTML de una URL usando headers específicos.
    
    Args:
        url: URL a obtener
        headers: Headers específicos a usar
    """
    return fetch_html(url, headers)

def fetch_json(url, headers=None):
    """
    Obtiene JSON de una URL usando múltiples estrategias.
    """
    if headers is None:
        headers = get_random_header_search()
    
    # Estrategia 1: Requests normal
    try:
        response = requests.get(url, headers=headers, timeout=15)
        if response.status_code == 200:
            return response.json()
        print(f"[INFO] JSON Estrategia 1 falló: {response.status_code}")
    except Exception as e:
        print(f"[INFO] JSON Estrategia 1 falló: {e}")

    # Estrategia 2: curl-cffi
    try:
        import curl_cffi.requests as curl_requests
        for browser in ['chrome120', 'chrome119']:
            try:
                response = curl_requests.get(url, headers=headers, timeout=30, impersonate=browser)
                if response.status_code == 200:
                    return response.json()
            except Exception as e:
                print(f"[INFO] JSON curl-cffi {browser} falló: {e}")
                continue
    except ImportError:
        pass
    
    return None