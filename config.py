BASE_URL = "https://sololatino.net"

TARGET_URLS = [
    {"nombre": "Películas", "url": f"{BASE_URL}/peliculas"},
    {"nombre": "Series", "url": f"{BASE_URL}/series"},
    {"nombre": "Anime", "url": f"{BASE_URL}/animes"},
    {"nombre": "Peliculas de Anime", "url": f"{BASE_URL}/genero/anime"},
    {"nombre": "Caricaturas", "url": f"{BASE_URL}/genre_series/toons"},
    {"nombre": "K-Drama", "url": f"{BASE_URL}/genre_series/kdramas/"},
    {"nombre": "Amazon", "url": f"{BASE_URL}/network/amazon"},
    {"nombre": "Apple TV", "url": f"{BASE_URL}/network/apple-tv"},
    {"nombre": "Disney", "url": f"{BASE_URL}/network/disney"},
    {"nombre": "HBO", "url": f"{BASE_URL}/network/hbo"},
    {"nombre": "HBO Max", "url": f"{BASE_URL}/network/hbo-max"},
    {"nombre": "Hulu", "url": f"{BASE_URL}/network/hulu"},
    {"nombre": "Netflix", "url": f"{BASE_URL}/network/netflix"},
]

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
}
