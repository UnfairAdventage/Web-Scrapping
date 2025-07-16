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
    # Buscar el primer <h1> que no sea el del logo
    h1_tags = soup.find_all('h1')
    titulo = ""
    for h in h1_tags:
        text = h.text.strip()
        clases = h.get('class')
        if text.lower() != "solo latino" and (not clases or "text" not in clases):
            titulo = text
            break
    if not titulo:
        print("[DEBUG] No se encontró un <h1> adecuado para el título. Mostrando todos los <h1> encontrados:")
        for idx, h in enumerate(h1_tags):
            print(f"  h1[{idx}]: '{h.text.strip()}' clases: {h.get('class')}")
    return {"sinopsis": sinopsis, "titulo": titulo}

def extract_sinopsis(html):
    soup = BeautifulSoup(html, 'html.parser')
    sinopsis_div = soup.select_one('div[itemprop="description"].wp-content')
    if sinopsis_div:
        p = sinopsis_div.find('p')
        return p.text.strip() if p else sinopsis_div.text.strip()
    return ""

def extract_main_image(html):
    soup = BeautifulSoup(html, 'html.parser')
    img = soup.select_one('div.poster img[itemprop="image"]')
    if img and img.get('src'):
        return img['src']
    return ""
