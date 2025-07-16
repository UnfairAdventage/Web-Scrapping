import requests
from config import HEADERS
from bs4 import BeautifulSoup

def fetch_html(url):
    try:
        response = requests.get(url, headers=HEADERS, timeout=10)
        response.raise_for_status()
        return response.text
    except requests.RequestException as e:
        print(f"[ERROR] Al obtener {url}: {e}")
        return None 