import random

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

USER_AGENTS = [
    # Actual user-agent
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36",
    # 20 extra user-agents
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:60.4.0) Gecko/20100101 Firefox/60.4.0",
    "Mozilla/5.0 (Windows NT 10.0; WOW64; rv:60.0.1) Gecko/20100101 Firefox/60.0.1",
    "Mozilla/5.0 (Windows NT 6.0; rv:65.0.1) Gecko/20100101 Firefox/65.0.1",
    "Mozilla/5.0 (Windows NT 6.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.80 Safari/537.36 OPR/56.0.3051.104",
    "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.162 Safari/537.36 OPR/51.0.2830.55",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:60.2.0) Gecko/20100101 Firefox/60.2.0",
    "Mozilla/5.0 (Windows NT 6.2; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729 Safari/537.36 OPR/57.0.3098.106",
    "Mozilla/5.0 (Windows NT 6.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729 Safari/537.36",
    "Mozilla/5.0 (Windows NT 6.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.81 Safari/537.36 OPR/55.0.2994.47",
    "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.92 Safari/537.36 OPR/55.0.2994.44",
    "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.98 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:61.0.1) Gecko/20100101 Firefox/61.0.1",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:52.1.0) Gecko/20100101 Firefox/52.1.0",
    "Mozilla/5.0 (Windows NT 6.2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.92 Safari/537.36 OPR/55.0.2994.44",
    "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.87 Safari/537.36 OPR/54.0.2952.54",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:61.0.1) Gecko/20100101 Firefox/61.0.1",
    "Mozilla/5.0 (Windows NT 6.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.92 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:51.0) Gecko/20100101 Firefox/51.0",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:54.0.1) Gecko/20100101 Firefox/54.0.1",
    "Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:52.7.0) Gecko/20100101 Firefox/52.7.0",
]

HEADERS_BASE = {
    "Referer": "https://www.sololatino.net/",
    "Connection": "keep-alive"
}

def get_random_headers():
    headers = HEADERS_BASE.copy()
    headers["User-Agent"] = random.choice(USER_AGENTS)
    return headers
