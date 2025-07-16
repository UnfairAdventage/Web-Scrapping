from bs4 import BeautifulSoup
from utils.parser import safe_text

def extract_from_listing(html):
    soup = BeautifulSoup(html, 'html.parser')
    articles = soup.select('article.item')
    data = []

    for article in articles:
        try:
            card = article.select_one('.poster')
            enlace = article.select_one('a')['href']
            post_id = article.get('data-id', 'N/A')
            slug = enlace.rstrip('/').split('/')[-1]
            titulo = safe_text(card.select_one('h3'))
            imagen = card.select_one('img').get('data-srcset', '')
            alt = card.select_one('img').get('alt', '')
            año = safe_text(card.select_one('.data p'))
            generos = safe_text(card.select_one('.data span'))
            idioma = 'Latino' if card.select_one('.audio .latino') else 'Otro'
            tipo_contenido = 'pelicula' if 'movies' in article.get('class', []) else 'serie' if 'tvshows' in article.get('class', []) else 'Otro'

            data.append({
                "id": post_id,
                "slug": slug,
                "titulo": titulo,
                "alt": alt,
                "imagen": imagen,
                "año": año,
                "generos": generos,
                "idioma": idioma,
                "url": enlace,
                "tipo": tipo_contenido
            })
        except Exception as e:
            print(f"[ERROR] Falló al parsear un artículo: {e}")
    
    return data

def extract_sinopsis_titulo(html):
    soup = BeautifulSoup(html, 'html.parser')
    sinopsis = safe_text(soup.select_one('div[itemprop="description"].wp-content'))
    titulo = safe_text(soup.select_one('h1.entry-title'))
    return {"sinopsis": sinopsis, "titulo": titulo}
