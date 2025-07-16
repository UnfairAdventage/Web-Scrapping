import requests
from bs4 import BeautifulSoup
from utils.parser import safe_text

def extract_episodios(url):
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    }
    response = requests.get(url, headers=headers)
    if not response.ok:
        print(f"[ERROR] No se pudo acceder a la URL: {url}")
        return {"episodios": [], "sinopsis": "", "titulo": ""}
    html = response.text
    soup = BeautifulSoup(html, 'html.parser')
    # Extraer sinopsis y título real
    sinopsis = safe_text(soup.select_one('div[itemprop="description"].wp-content'))
    titulo = safe_text(soup.select_one('h1.entry-title'))
    temporadas = soup.select('#seasons .se-c')
    data = []
    for temporada_div in temporadas:
        temporada_num = int(temporada_div.get('data-season', 0))
        episodios = temporada_div.select('li')
        for episodio in episodios:
            try:
                link = episodio.select_one('a')['href']
                titulo_ep = episodio.select_one('.epst').text.strip()
                numerando = episodio.select_one('.numerando').text.strip()
                numero_ep = int(numerando.split('-')[-1].strip())
                fecha = episodio.select_one('.date').text.strip()
                imagen = episodio.select_one('img')['src']
                data.append({
                    "temporada": temporada_num,
                    "episodio": numero_ep,
                    "titulo": titulo_ep,
                    "fecha": fecha,
                    "url": link,
                    "imagen": imagen
                })
            except Exception as e:
                print(f"⚠️ Error en episodio: {e}")
    return {"episodios": data, "sinopsis": sinopsis, "titulo": titulo} 