import asyncio
import sys
sys.path.append('./Proyecto')

from pydoll.browser import Chrome
from pydoll.constants import By
from extractors.iframe_extractor import extract_iframe_player
from extractors.generic_extractor import extract_sinopsis_titulo
from utils.http_client import fetch_html

MOVIES = [
    {
        'name': 'Snake Hotel',
        'url': 'https://sololatino.net/peliculas/snake-hotel/'
    },
    {
        'name': 'Dicks: El Músical',
        'url': 'https://sololatino.net/peliculas/dicks-el-musical/'
    }
]

async def cloudflare_example():
    async with Chrome() as browser:
        tab = await browser.start(headless=False)
        async with tab.expect_and_bypass_cloudflare_captcha():
            await tab.go_to('https://anticheat.ac/')

        await tab.take_screenshot('anticheat.png')
        print('Captcha handled, continuing...')
        await asyncio.sleep(5)  # just to see the result :)

def test_movie_extraction():
    for movie in MOVIES:
        print(f"\n===== Probando película: {movie['name']} =====")
        url = movie['url']
        html = fetch_html(url)
        if not html:
            print(f"[ERROR] No se pudo obtener HTML para {url}")
            continue
        print(f"[DEBUG] HTML descargado para {movie['name']} (primeros 500 chars):\n{html[:500]}")
        # Probar sinopsis y título
        info = extract_sinopsis_titulo(html)
        print(f"[DEBUG] Título extraído: {info.get('titulo')}")
        if not info.get('titulo'):
            from bs4 import BeautifulSoup
            soup = BeautifulSoup(html, 'html.parser')
            print("[TEST DEBUG] Mostrando todos los <h1> encontrados:")
            for idx, h in enumerate(soup.find_all('h1')):
                print(f"  h1[{idx}]: '{h.text.strip()}' clases: {h.get('class')}")
            header = soup.find('header')
            if header:
                print(f"[TEST DEBUG] HTML de <header> (primeros 300 chars):\n{str(header)[:300]}")
            else:
                print("[TEST DEBUG] No se encontró <header> en el HTML.")
        print(f"[DEBUG] Sinopsis extraída: {info.get('sinopsis')}")
        # Probar iframe player
        player = extract_iframe_player(url)
        if player:
            print(f"[DEBUG] Player extraído: {player}")
        else:
            print(f"[ERROR] No se pudo extraer el reproductor para {movie['name']}")

if __name__ == '__main__':
    test_movie_extraction()
