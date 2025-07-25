import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../')))
from config import TARGET_URLS, HEADERS
from utils.http_client import fetch_html
from extractors.generic_extractor import extraer_listado

# Definir variantes de headers
HEADERS_WITH_ACCEPT = HEADERS.copy()
HEADERS_NO_ACCEPT = HEADERS.copy()
HEADERS_NO_ACCEPT.pop("Accept", None)
HEADERS_NO_ACCEPT.pop("Accept-Encoding", None)
HEADERS_NO_ACCEPT.pop("Accept-Language", None)

# URLs a probar
urls = {}
# Listado (películas)
for entry in TARGET_URLS:
    if entry["nombre"].lower().startswith("película"):
        urls["listado"] = entry["url"] + "?pagina=1"
        break
# Search (ejemplo: buscar "naruto")
urls["search"] = "https://sololatino.net/?s=naruto"
# Deep search (ejemplo: buscar "one piece" en animes)
urls["deep_search"] = "https://sololatino.net/animes?search=one+piece"

# Función para probar una URL con headers
import requests
def test_url(url, headers, label):
    print(f"\n[{label}] Probando: {url}\nHeaders: {headers}\n---")
    try:
        resp = requests.get(url, headers=headers, timeout=15)
        resp.raise_for_status()
        html = resp.text
        items = extraer_listado(html)
        print(f"Items extraídos: {len(items)}")
        for i, item in enumerate(items):
            print(f"{i+1}. {item['titulo']}")
    except Exception as e:
        print(f"[ERROR] No se pudo obtener la página: {e}")

# Ejecutar pruebas
for nombre, url in urls.items():
    test_url(url, HEADERS_WITH_ACCEPT, f"{nombre} (con Accept)")
    test_url(url, HEADERS_NO_ACCEPT, f"{nombre} (sin Accept)") 