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
    imagen_poster = poster_img['src'] if poster_img and poster_img.has_attr('src') else ''
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
                imagen = episodio.select_one('img')['src'] if episodio.select_one('img') else ''
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