import requests
from bs4 import BeautifulSoup
from utils.parser import safe_text
from utils.adblocker import clean_html_ads

def extract_iframe_player(url):
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    }
    response = requests.get(url, headers=headers)
    if not response.ok:
        print(f"❌ Error al acceder a: {url}")
        return None
    # Limpiar HTML de anuncios antes de parsear
    cleaned_html = clean_html_ads(response.text)
    soup = BeautifulSoup(cleaned_html, 'html.parser')
    iframe = soup.select_one('.dooplay_player iframe')
    if iframe and iframe.get('src'):
        player_url = iframe['src']
        return {
            "player_url": player_url,
            "fuente": player_url.split('/')[2],  # dominio
            "formato": "iframe"
        }
    else:
        print("⚠️ No se encontró iframe de reproducción.")
        return None 