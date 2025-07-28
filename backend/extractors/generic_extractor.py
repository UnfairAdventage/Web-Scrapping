from bs4 import BeautifulSoup


def extraer_listado(html):
    soup = BeautifulSoup(html, 'html.parser')
    articulos = soup.select('article.item')
    datos = []
    for articulo in articulos:
        try:
            poster = articulo.select_one('.poster')
            enlace = articulo.select_one('a')['href']
            id_post = articulo.get('data-id', 'N/A')
            slug = enlace.rstrip('/').split('/')[-1]
            titulo = poster.select_one('h3').text.strip() if poster.select_one('h3') else ''
            imagen = poster.select_one('img').get('data-srcset', '')
            alt = poster.select_one('img').get('alt', '')
            year = poster.select_one('.data p').text.strip() if poster.select_one('.data p') else ''
            generos = poster.select_one('.data span').text.strip() if poster.select_one('.data span') else ''
            idioma = 'Latino' if poster.select_one('.audio .latino') else 'Otro'
            tipo = 'pelicula' if 'movies' in articulo.get('class', []) else 'serie' if 'tvshows' in articulo.get('class', []) else 'Otro'
            datos.append({
                "id": id_post,
                "slug": slug,
                "titulo": titulo,
                "alt": alt,
                "imagen": imagen,
                "year": year,
                "generos": generos,
                "idioma": idioma,
                "tipo": tipo,
                "url": enlace
            })
        except Exception as e:
            print(f"[ERROR] Falló al parsear un artículo: {e}")
    return datos


def extraer_info_pelicula(html):
    soup = BeautifulSoup(html, 'html.parser')
    titulo = soup.select_one('div.data h1')
    titulo = titulo.text.strip() if titulo else 'No encontrado'
    sinopsis_div = soup.find('div', itemprop='description')
    sinopsis = sinopsis_div.find('p').text.strip() if sinopsis_div and sinopsis_div.find('p') else ''
    fecha_estreno = soup.find('span', itemprop='dateCreated')
    fecha_estreno = fecha_estreno.text.strip() if fecha_estreno else ''
    generos_div = soup.find('div', class_='sgeneros')
    generos = [a.text.strip() for a in generos_div.find_all('a')] if generos_div else []
    poster_img = soup.select_one('div.poster img')
    imagen_poster = poster_img['src'] if poster_img and poster_img.has_attr('src') else ''
    return {
        'titulo': titulo,
        'sinopsis': sinopsis,
        'fecha_estreno': fecha_estreno,
        'generos': generos,
        'imagen_poster': imagen_poster
    }
