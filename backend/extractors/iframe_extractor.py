import requests
from bs4 import BeautifulSoup
from backend.utils.adblocker import clean_html_ads


def extraer_iframe_reproductor(url):
    cabeceras = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    }
    respuesta = requests.get(url, headers=cabeceras)
    if not respuesta.ok:
        print(f"❌ Error al acceder a: {url}")
        return None
    html_limpio = clean_html_ads(respuesta.text)
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