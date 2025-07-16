import sys
import os
import unicodedata
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from config import TARGET_URLS
from utils.http_client import fetch_html
from extractors.generic_extractor import extract_from_listing, extract_sinopsis_titulo
from extractors.serie_extractor import extract_episodios
from extractors.iframe_extractor import extract_iframe_player

app = Flask(__name__)
CORS(app)

SECCIONES = {s['nombre']: s['url'] for s in TARGET_URLS}
SECCIONES_LIST = list(SECCIONES.keys())

def normaliza(texto):
    return unicodedata.normalize('NFKD', texto).encode('ascii', 'ignore').decode('ascii').lower()

@app.route('/api/secciones', methods=['GET'])
def api_secciones():
    return jsonify({"secciones": SECCIONES_LIST})

@app.route('/api/listado', methods=['GET'])
def api_listado():
    busqueda = request.args.get('busqueda')
    if busqueda:
        import requests
        query = busqueda.strip()
        url = f"https://sololatino.net/wp-json/dooplay/search/?keyword={query}&nonce=84428a202e"
        try:
            resp = requests.get(url, timeout=10)
            resp.raise_for_status()
            data = resp.json()
            items = []
            if isinstance(data, dict):
                for k, v in data.items():
                    if isinstance(v, dict):
                        tipo_val = v.get("type", "").lower()
                        if tipo_val == "pelicula":
                            tipo = "movie"
                        elif tipo_val == "serie":
                            tipo = "series"
                        else:
                            tipo = "anime"
                        items.append({
                            "id": k,
                            "slug": v.get("url", "").rstrip('/').split('/')[-1] if v.get("url") else "",
                            "title": v.get("title", ""),
                            "alt": v.get("title", ""),
                            "image": v.get("img", ""),
                            "year": v.get("extra", {}).get("date", ""),
                            "genres": "",
                            "language": "Latino",
                            "url": v.get("url", ""),
                            "type": tipo
                        })
            elif isinstance(data, list):
                items = []
            else:
                return jsonify({"resultados": [], "seccion": "Busqueda", "pagina": 1, "warning": f"Respuesta inesperada: {data}"}), 200
            return jsonify({"resultados": items, "seccion": "Busqueda", "pagina": 1})
        except Exception as e:
            return jsonify({"error": f"No se pudo buscar: {str(e)}"}), 500
    # Si no se manda sección, usar la primera disponible
    seccion = request.args.get('seccion')
    pagina = int(request.args.get('pagina', 1))
    # Si no se manda sección, usar la primera disponible
    if not seccion:
        seccion = SECCIONES_LIST[0]
    # Buscar sección tolerante a acentos y mayúsculas
    seccion_normalizada = normaliza(seccion)
    seccion_real = None
    for nombre in SECCIONES_LIST:
        if normaliza(nombre) == seccion_normalizada:
            seccion_real = nombre
            break
    if not seccion_real:
        return jsonify({"error": "Sección no encontrada"}), 404
    url = SECCIONES[seccion_real]
    if pagina > 1:
        if seccion_real != 'K-Drama':
            url = f"{url}/page/{pagina}"
        else:
            url = f"{url}page/{pagina}"
    html = fetch_html(url)
    if html:
        resultados = extract_from_listing(html)
    else:
        return jsonify({"error": "No se pudo obtener HTML para la página."}), 500
    return jsonify({"resultados": resultados, "seccion": seccion_real, "pagina": pagina})

@app.route('/api/serie/<slug>', methods=['GET'])
def api_ver_serie(slug):
    url = None
    # Buscar primero en series
    for s in TARGET_URLS:
        if s['nombre'].lower() == 'series':
            url = f"{s['url']}/{slug}"
            break
    info = {"sinopsis": "", "titulo": ""}
    result = extract_episodios(url) if url else {"episodios": [], "sinopsis": "", "titulo": ""}
    episodios = result.get("episodios", [])
    info["sinopsis"] = result.get("sinopsis", "")
    info["titulo"] = result.get("titulo", "")
    # Si no hay episodios, intentar en animes
    if not episodios:
        for s in TARGET_URLS:
            if s['nombre'].lower() == 'anime':
                url = f"{s['url']}/{slug}"
                result = extract_episodios(url)
                episodios = result.get("episodios", [])
                info["sinopsis"] = result.get("sinopsis", "")
                info["titulo"] = result.get("titulo", "")
                if episodios:
                    break
    if not episodios:
        return jsonify({"error": "Serie o anime no encontrado"}), 404
    temporadas = {}
    for ep in episodios:
        t = ep['temporada']
        if t not in temporadas:
            temporadas[t] = []
        temporadas[t].append(ep)
    return jsonify({"slug": slug, "info": info, "temporadas": temporadas})

@app.route('/api/pelicula/<slug>', methods=['GET'])
def api_ver_pelicula(slug):
    url = None
    # Buscar primero en películas
    for s in TARGET_URLS:
        if s['nombre'].lower() == 'peliculas':
            url = f"{s['url']}/{slug}"
            break
    player = extract_iframe_player(url) if url else None
    info = {"sinopsis": "", "titulo": ""}
    if url:
        import requests
        resp = requests.get(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})
        if resp.ok:
            extra = extract_sinopsis_titulo(resp.text)
            info["sinopsis"] = extra.get("sinopsis", "")
            info["titulo"] = extra.get("titulo", "")
    # Si no hay player, intentar en películas de anime
    if not player:
        for s in TARGET_URLS:
            if s['nombre'].lower() == 'peliculas de anime':
                url = f"{s['url']}/{slug}"
                player = extract_iframe_player(url)
                if url:
                    import requests
                    resp = requests.get(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})
                    if resp.ok:
                        extra = extract_sinopsis_titulo(resp.text)
                        info["sinopsis"] = extra.get("sinopsis", "")
                        info["titulo"] = extra.get("titulo", "")
                if player:
                    break
    if not player:
        return jsonify({"error": "Película o película de anime no encontrada"}), 404
    return jsonify({"slug": slug, "player": player, "url": url, "info": info})

@app.route('/api/anime/<slug>', methods=['GET'])
def api_ver_anime(slug):
    url = None
    # Buscar en la ruta de animes
    for s in TARGET_URLS:
        if s['nombre'].lower() == 'anime':
            url = f"{s['url']}/{slug}"
            break
    result = extract_episodios(url) if url else {"episodios": [], "sinopsis": "", "titulo": ""}
    episodios = result.get("episodios", [])
    info = {"sinopsis": result.get("sinopsis", ""), "titulo": result.get("titulo", "")}
    if not episodios:
        return jsonify({"error": "Anime no encontrado"}), 404
    temporadas = {}
    for ep in episodios:
        t = ep['temporada']
        if t not in temporadas:
            temporadas[t] = []
        temporadas[t].append(ep)
    return jsonify({"slug": slug, "info": info, "temporadas": temporadas})

@app.route('/api/iframe_player', methods=['GET'])
def api_iframe_player():
    url = request.args.get('url')
    if not url:
        return jsonify({'error': 'Falta URL'}), 400
    player = extract_iframe_player(url)
    if not player:
        return jsonify({'error': 'No se encontró el reproductor'}), 404
    return jsonify(player)

# === SERVIR FRONTEND COMPILADO ===
FRONTEND_DIST = os.path.join(os.path.dirname(__file__), 'FrontEnd', 'dist')
print(FRONTEND_DIST)
@app.route('/assets/<path:path>')
def send_assets(path):
    return send_from_directory(os.path.join(FRONTEND_DIST, 'assets'), path)

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_frontend(path):
    # Si la ruta existe como archivo, la servimos
    file_path = os.path.join(FRONTEND_DIST, path)
    if path != "" and os.path.exists(file_path):
        return send_from_directory(FRONTEND_DIST, path)
    # Si no, devolvemos el index.html (SPA fallback)
    return send_from_directory(FRONTEND_DIST, 'index.html')

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port="1234")