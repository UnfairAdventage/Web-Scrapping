import sys
import os
import unicodedata
import requests
from urllib.parse import quote_plus
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from config import TARGET_URLS, get_random_headers, get_random_header_search, APP_VERSION, GITHUB_VERSION_URL, GITHUB_CHANGES_URL
from backend.utils.http_client import fetch_html
from backend.extractors.generic_extractor import extraer_listado, extraer_info_pelicula
from backend.extractors.serie_extractor import extraer_episodios_serie
from backend.extractors.iframe_extractor import extraer_iframe_reproductor

app = Flask(__name__)
CORS(app)
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0
app.config['ETAG_DISABLED'] = True

SECCIONES = {s['nombre']: s['url'] for s in TARGET_URLS}
SECCIONES_LIST = list(SECCIONES.keys())

def normaliza(texto):
    return unicodedata.normalize('NFKD', texto).encode('ascii', 'ignore').decode('ascii').lower()

def compare_versions(local, remote):
    def parse(v):
        return [int(x) for x in v.strip().split('.')]
    l, r = parse(local), parse(remote)
    for lv, rv in zip(l, r):
        if lv < rv:
            return -1
        elif lv > rv:
            return 1
    if len(l) < len(r):
        return -1
    if len(l) > len(r):
        return 1
    return 0

@app.route('/api/version', methods=['GET'])
def api_version():
    try:
        remote_version = requests.get(GITHUB_VERSION_URL, timeout=5).text.strip()
    except Exception as e:
        return jsonify({"error": f"No se pudo obtener la versión remota: {e}", "version": APP_VERSION}), 200
    cmp = compare_versions(APP_VERSION, remote_version)
    if cmp < 0:
        return jsonify({
            "version": APP_VERSION,
            "latest_version": remote_version,
            "update_available": True,
            "changes": None
        })
    elif cmp == 0:
        # Si está actualizado, obtener los cambios
        try:
            changes = requests.get(GITHUB_CHANGES_URL, timeout=5).text
        except Exception as e:
            changes = None
        return jsonify({
            "version": APP_VERSION,
            "latest_version": remote_version,
            "update_available": False,
            "changes": changes
        })
    else:
        return jsonify({
            "version": APP_VERSION,
            "latest_version": remote_version,
            "update_available": False,
            "changes": None
        })

@app.route('/api/secciones', methods=['GET'])
def api_secciones():
    return jsonify({"secciones": SECCIONES_LIST})

@app.route('/api/listado', methods=['GET'])
def api_listado():
    busqueda = request.args.get('busqueda')
    if busqueda:
        query = busqueda.strip()
        url = f"https://sololatino.net/wp-json/dooplay/search/?keyword={query}&nonce=84428a202e"
        try:
            resp = requests.get(url, headers=get_random_header_search(), timeout=10)
            resp.raise_for_status()
            data = resp.json()
            items = []
            if isinstance(data, dict):
                for k, v in data.items():
                    if isinstance(v, dict):
                        tipo_val = v.get("type", "").lower()
                        tipo = "movie" if tipo_val == "pelicula" else "series" if tipo_val == "serie" else "anime"
                        items.append({
                            "id": k,
                            "slug": v.get("url", "").rstrip('/').split('/')[-1] if v.get("url") else "",
                            "title": v.get("title", ""),
                            "alt": v.get("title", ""),
                            "image": v.get("img", ""),
                            "year": v.get("extra", {}).get("date", ""),
                            "language": "Latino",
                            "type": tipo
                        })
            elif isinstance(data, list):
                items = []
            else:
                return jsonify({"resultados": [], "seccion": "Busqueda", "pagina": 1, "warning": f"Respuesta inesperada: {data}"}), 200
            return jsonify({"resultados": items, "seccion": "Busqueda", "pagina": 1})
        except Exception as e:
            return jsonify({"error": f"No se pudo buscar: {str(e)}"}), 500
    seccion = request.args.get('seccion')
    pagina = int(request.args.get('pagina', 1))
    if not seccion:
        seccion = SECCIONES_LIST[0]
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
        resultados = extraer_listado(html)
        # Asegurar que cada item tenga el campo 'url'
        for item in resultados:
            if 'url' not in item or not item['url']:
                # Construir una URL básica usando la sección y el slug
                item['url'] = f"{url.rstrip('/')}/{item.get('slug', '')}"
    else:
        return jsonify({"error": "No se pudo obtener HTML para la página."}), 500
    return jsonify({"resultados": resultados, "seccion": seccion_real, "pagina": pagina})

@app.route('/api/deep-search', methods=['GET'])
def api_deep_search():
    query = request.args.get('query', '').strip()
    if not query:
        return jsonify({'error': 'Falta el parámetro de búsqueda'}), 400
    url = f"https://sololatino.net/?s={quote_plus(query)}"
    try:
        resp = requests.get(url, headers=get_random_headers(), timeout=10)
        resp.raise_for_status()
        html = resp.text
        resultados = extraer_listado(html)
        return jsonify(resultados)
    except Exception as e:
        return jsonify({'error': f'No se pudo realizar la búsqueda profunda: {str(e)}'}), 500

@app.route('/api/serie/<slug>', methods=['GET'])
def api_ver_serie(slug):
    url = None
    for s in TARGET_URLS:
        if s['nombre'].lower() == 'series':
            url = f"{s['url']}/{slug}"
            break
    result = extraer_episodios_serie(url) if url else {"episodios": [], "info": {}}
    episodios = result.get("episodios", [])
    info = result.get("info", {})
    if not episodios:
        for s in TARGET_URLS:
            if s['nombre'].lower() == 'anime':
                url = f"{s['url']}/{slug}"
                result = extraer_episodios_serie(url)
                episodios = result.get("episodios", [])
                info = result.get("info", {})
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
    encontrado_en = None
    for s in TARGET_URLS:
        if normaliza(s['nombre']) == 'peliculas':
            url = f"{s['url']}/{slug}"
            break
    print(f"[DEBUG] Buscando en Películas: {url}")
    player = extraer_iframe_reproductor(url) if url else None
    info = {}
    if url:
        resp = requests.get(url, headers=get_random_headers())
        print(f"[DEBUG] Status code de requests.get (Películas): {resp.status_code}")
        if resp.ok:
            print(f"[DEBUG] HTML descargado (primeros 500 chars, Películas):\n{resp.text[:500]}")
            info = extraer_info_pelicula(resp.text)
    if player:
        encontrado_en = "peliculas"
    if not player:
        for s in TARGET_URLS:
            if normaliza(s['nombre']) == 'peliculas de anime':
                url = f"{s['url']}/{slug}"
                print(f"[DEBUG] Buscando en Peliculas de Anime: {url}")
                player = extraer_iframe_reproductor(url)
                if url:
                    resp = requests.get(url, headers=get_random_headers())
                    print(f"[DEBUG] Status code de requests.get (Peliculas de Anime): {resp.status_code}")
                    if resp.ok:
                        print(f"[DEBUG] HTML descargado (primeros 500 chars, Peliculas de Anime):\n{resp.text[:500]}")
                        info = extraer_info_pelicula(resp.text)
                if player:
                    encontrado_en = "peliculas de anime"
                    break
    if not player:
        print(f"[ERROR] No se encontró reproductor para {slug} en ninguna sección")
        return jsonify({"error": "Película no encontrada en películas ni en películas de anime"}), 404
    player = {
        "player_url": player.get("player_url"),
        "source": player.get("fuente"),
        "format": player.get("formato")
    }
    print(f"[DEBUG] Encontrado en: {encontrado_en}")
    print(f"[DEBUG] Respuesta final: slug={slug}, player={player}, url={url}, info={info}, encontrado_en={encontrado_en}")
    return jsonify({"slug": slug, "player": player, "info": info, "encontrado_en": encontrado_en})

@app.route('/api/anime/<slug>', methods=['GET'])
def api_ver_anime(slug):
    url = None
    for s in TARGET_URLS:
        if s['nombre'].lower() == 'anime':
            url = f"{s['url']}/{slug}"
            break
    result = extraer_episodios_serie(url) if url else {"episodios": [], "info": {}}
    episodios = result.get("episodios", [])
    info = result.get("info", {})
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
    player = extraer_iframe_reproductor(url)
    if not player:
        return jsonify({'error': 'No se encontró el reproductor'}), 404
    return jsonify(player)

FRONTEND_DIST = os.path.abspath(os.path.join(os.path.dirname(__file__), '../frontend/dist'))
@app.route('/assets/<path:path>')
def send_assets(path):
    return send_from_directory(os.path.join(FRONTEND_DIST, 'assets'), path)

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_frontend(path):
    file_path = os.path.join(FRONTEND_DIST, path)
    if path != "" and os.path.exists(file_path):
        return send_from_directory(FRONTEND_DIST, path)
    return send_from_directory(FRONTEND_DIST, 'index.html')

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port="1234")