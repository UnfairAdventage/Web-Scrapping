import requests
from config import get_random_headers
from bs4 import BeautifulSoup

def fetch_html(url, headers=None):
    """
    Obtiene HTML de una URL usando headers aleatorios por defecto.
    
    Args:
        url: URL a obtener
        headers: Headers personalizados (opcional). Si no se proporciona, usa headers aleatorios.
    """
    if headers is None:
        headers = get_random_headers()
    
    try:
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        return response.text
    except requests.RequestException as e:
        print(f"[ERROR] Al obtener {url}: {e}")
        return None

def fetch_html_with_headers(url, headers):
    """
    Obtiene HTML de una URL usando headers específicos.
    
    Args:
        url: URL a obtener
        headers: Headers específicos a usar
    """
    return fetch_html(url, headers) 