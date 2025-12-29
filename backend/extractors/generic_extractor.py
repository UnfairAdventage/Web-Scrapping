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
            img_tag = poster.select_one('img')
            imagen = ''
            if img_tag:
                # Prioridad para evitar lazy-loading placeholders
                # 1. Intentar buscar en atributos data
                imagen = img_tag.get('data-srcset') or img_tag.get('data-src') or img_tag.get('data-lazy-src') or img_tag.get('src', '')
                
                # 2. Si sigue siendo un placeholder, buscar un noscript hermano
                if 'data:image' in imagen:
                    noscript = articulo.select_one('noscript img')
                    if noscript:
                        imagen = noscript.get('src', imagen)
                
                # 3. Limpiar srcset
                if ',' in imagen:
                    imagen = imagen.split(',')[0].split(' ')[0]
            
            alt = img_tag.get('alt', '') if img_tag else ''
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
    imagen_poster = ''
    if poster_img:
        imagen_poster = poster_img.get('data-src') or poster_img.get('data-lazy-src') or poster_img.get('src', '')
        
        # Si es placeholder, intentar noscript
        if 'data:image' in imagen_poster:
            noscript = soup.select_one('div.poster noscript img')
            if noscript:
                imagen_poster = noscript.get('src', imagen_poster)
    
    # Si aún no hay imagen o es placeholder, buscar en metadatos (OG Tags)
    if not imagen_poster or 'data:image' in imagen_poster:
        og_image = soup.find('meta', property='og:image')
        if og_image:
            imagen_poster = og_image.get('content', imagen_poster)
        else:
            twitter_image = soup.find('meta', name='twitter:image')
            if twitter_image:
                imagen_poster = twitter_image.get('content', imagen_poster)
    return {
        'titulo': titulo,
        'sinopsis': sinopsis,
        'fecha_estreno': fecha_estreno,
        'generos': generos,
        'imagen_poster': imagen_poster
    }
