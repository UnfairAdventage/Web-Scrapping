from bs4 import BeautifulSoup
from backend.utils.adblocker import clean_html_ads
from backend.utils.http_client import fetch_html


def extraer_iframe_reproductor(url):
    html = fetch_html(url)
    if not html:
        print(f"❌ Error al acceder a: {url}")
        return None
    html_limpio = clean_html_ads(html)
    soup = BeautifulSoup(html_limpio, 'html.parser')
    iframe = soup.select_one('.dooplay_player iframe')
    if iframe and iframe.get('src'):
        url_reproductor = iframe['src']
        return {
            "player_url": url_reproductor,
            "fuente": url_reproductor.split('/')[2],  # dominio
            "formato": "iframe"
        }
    else:
        print("⚠️ No se encontró iframe de reproducción.")
        return None 