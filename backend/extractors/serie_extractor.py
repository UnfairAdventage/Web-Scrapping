from bs4 import BeautifulSoup
from backend.utils.http_client import fetch_html


def extraer_episodios_serie(url):
    html = fetch_html(url)
    if not html:
        print(f"[ERROR] No se pudo acceder a la URL: {url}")
        return {"info": {}, "episodios": []}
    soup = BeautifulSoup(html, 'html.parser')
    sinopsis = soup.select_one('div[itemprop="description"].wp-content')
    sinopsis = sinopsis.text.strip() if sinopsis else ''
    # Extraer título (más robusto)
    titulo = ''
    titulo_data = soup.select_one('div.data h1')
    if titulo_data:
        titulo = titulo_data.text.strip()
    else:
        titulo_alt = soup.select_one('h1.entry-title')
        titulo = titulo_alt.text.strip() if titulo_alt else ''
    # Extraer géneros
    generos_div = soup.find('div', class_='sgeneros')
    generos = [a.text.strip() for a in generos_div.find_all('a')] if generos_div else []
    # Extraer imagen de póster
    poster_img = soup.select_one('div.poster img')
    imagen_poster = ''
    if poster_img:
        imagen_poster = poster_img.get('data-src') or poster_img.get('data-lazy-src') or poster_img.get('src', '')
        
        # Si es placeholder, intentar noscript
        if 'data:image' in imagen_poster:
            noscript = soup.select_one('div.poster noscript img')
            if noscript:
                imagen_poster = noscript.get('src', imagen_poster)
    
    # Fallback a OG Tags si es necesario
    if not imagen_poster or 'data:image' in imagen_poster:
        og_image = soup.find('meta', property='og:image')
        if og_image:
            imagen_poster = og_image.get('content', imagen_poster)
    temporadas_divs = soup.select('#seasons .se-c')
    episodios_data = []
    fechas_episodios = []
    for temporada_div in temporadas_divs:
        num_temporada = int(temporada_div.get('data-season', 0))
        episodios = temporada_div.select('li')
        for episodio in episodios:
            try:
                enlace_episodio = episodio.select_one('a')['href']
                titulo_ep = episodio.select_one('.epst').text.strip() if episodio.select_one('.epst') else ''
                numerando = episodio.select_one('.numerando').text.strip() if episodio.select_one('.numerando') else ''
                numero_ep = int(numerando.split('-')[-1].strip()) if numerando else 0
                fecha = episodio.select_one('.date').text.strip() if episodio.select_one('.date') else ''
                if fecha:
                    fechas_episodios.append(fecha)
                img_ep = episodio.select_one('img')
                imagen = ''
                if img_ep:
                    imagen = img_ep.get('data-src') or img_ep.get('data-lazy-src') or img_ep.get('src', '')
                    if 'data:image' in imagen and img_ep.get('data-src'):
                        imagen = img_ep.get('data-src')
                episodios_data.append({
                    "temporada": num_temporada,
                    "episodio": numero_ep,
                    "titulo": titulo_ep,
                    "fecha": fecha,
                    "imagen": imagen,
                    "url": enlace_episodio
                })
            except Exception as e:
                print(f"⚠️ Error en episodio: {e}")
    # Tomar la fecha del primer episodio como fecha de estreno
    fecha_estreno = fechas_episodios[0] if fechas_episodios else ''
    info = {
        "titulo": titulo,
        "sinopsis": sinopsis,
        "generos": generos,
        "imagen_poster": imagen_poster,
        "fecha_estreno": fecha_estreno
    }
    return {"info": info, "episodios": episodios_data} 