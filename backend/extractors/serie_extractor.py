import requests
from bs4 import BeautifulSoup


def extraer_episodios_serie(url):
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    }
    respuesta = requests.get(url, headers=headers)
    if not respuesta.ok:
        print(f"[ERROR] No se pudo acceder a la URL: {url}")
        return {"info": {}, "episodios": []}
    html = respuesta.text
    soup = BeautifulSoup(html, 'html.parser')
    sinopsis = soup.select_one('div[itemprop="description"].wp-content')
    sinopsis = sinopsis.text.strip() if sinopsis else ''
    titulo = soup.select_one('h1.entry-title')
    titulo = titulo.text.strip() if titulo else ''
    # Extraer géneros
    generos_div = soup.find('div', class_='sgeneros')
    generos = [a.text.strip() for a in generos_div.find_all('a')] if generos_div else []
    # Extraer imagen de póster
    poster_img = soup.select_one('div.poster img')
    imagen_poster = poster_img['src'] if poster_img and poster_img.has_attr('src') else ''
    # Extraer año/fecha de estreno
    fecha_estreno = soup.find('span', itemprop='dateCreated')
    fecha_estreno = fecha_estreno.text.strip() if fecha_estreno else ''
    temporadas_divs = soup.select('#seasons .se-c')
    episodios_data = []
    for temporada_div in temporadas_divs:
        num_temporada = int(temporada_div.get('data-season', 0))
        episodios = temporada_div.select('li')
        for episodio in episodios:
            try:
                titulo_ep = episodio.select_one('.epst').text.strip() if episodio.select_one('.epst') else ''
                numerando = episodio.select_one('.numerando').text.strip() if episodio.select_one('.numerando') else ''
                numero_ep = int(numerando.split('-')[-1].strip()) if numerando else 0
                fecha = episodio.select_one('.date').text.strip() if episodio.select_one('.date') else ''
                imagen = episodio.select_one('img')['src'] if episodio.select_one('img') else ''
                episodios_data.append({
                    "temporada": num_temporada,
                    "episodio": numero_ep,
                    "titulo": titulo_ep,
                    "fecha": fecha,
                    "imagen": imagen
                })
            except Exception as e:
                print(f"⚠️ Error en episodio: {e}")
    info = {
        "titulo": titulo,
        "sinopsis": sinopsis,
        "generos": generos,
        "imagen_poster": imagen_poster,
        "fecha_estreno": fecha_estreno
    }
    return {"info": info, "episodios": episodios_data} 