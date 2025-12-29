"""
Cliente HTTP avanzado para superar protecciones anti-bot
"""

import requests
import time
import random
import json
from config import get_random_headers, get_random_header_search

class AdvancedHTTPClient:
    def __init__(self):
        self.session = requests.Session()
        self.proxies = [
            # Lista de proxies gratuitos (pueden no funcionar)
            "8.8.8.8:8080",
            "1.1.1.1:8080",
        ]
        
    def get_realistic_headers(self):
        """Genera headers más realistas"""
        user_agents = [
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:121.0) Gecko/20100101 Firefox/121.0"
        ]
        
        return {
            'User-Agent': random.choice(user_agents),
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
            'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
            'Referer': 'https://www.google.com/',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'cross-site',
            'Sec-Fetch-User': '?1',
            'Cache-Control': 'max-age=0',
            'DNT': '1',
            'Sec-GPC': '1'
        }
    
    def fetch_with_retry(self, url, max_retries=3):
        """Intenta obtener la URL con múltiples estrategias"""
        
        strategies = [
            self._strategy_basic_headers,
            self._strategy_search_headers,
            self._strategy_realistic_headers,
            self._strategy_with_delay,
            self._strategy_with_proxy
        ]
        
        for i, strategy in enumerate(strategies, 1):
            print(f"[INFO] Probando estrategia {i}...")
            try:
                result = strategy(url)
                if result and result.status_code == 200:
                    print(f"[SUCCESS] Éxito con estrategia {i}")
                    return result.text
                elif result:
                    print(f"[INFO] Estrategia {i} falló: {result.status_code}")
                else:
                    print(f"[INFO] Estrategia {i} falló: Sin respuesta")
            except Exception as e:
                print(f"[INFO] Estrategia {i} falló: {e}")
            
            # Delay entre estrategias
            if i < len(strategies):
                time.sleep(random.uniform(2, 5))
        
        print(f"[ERROR] Todas las estrategias fallaron para {url}")
        return None
    
    def _strategy_basic_headers(self, url):
        """Estrategia 1: Headers básicos"""
        headers = get_random_headers()
        return self.session.get(url, headers=headers, timeout=15)
    
    def _strategy_search_headers(self, url):
        """Estrategia 2: Headers de búsqueda"""
        headers = get_random_header_search()
        return self.session.get(url, headers=headers, timeout=15)
    
    def _strategy_realistic_headers(self, url):
        """Estrategia 3: Headers realistas"""
        headers = self.get_realistic_headers()
        return self.session.get(url, headers=headers, timeout=15)
    
    def _strategy_with_delay(self, url):
        """Estrategia 4: Con delay aleatorio"""
        time.sleep(random.uniform(3, 7))
        headers = self.get_realistic_headers()
        return self.session.get(url, headers=headers, timeout=20)
    
    def _strategy_with_proxy(self, url):
        """Estrategia 5: Con proxy (si está disponible)"""
        if self.proxies:
            proxy = random.choice(self.proxies)
            proxies = {
                'http': f'http://{proxy}',
                'https': f'http://{proxy}'
            }
            headers = self.get_realistic_headers()
            return self.session.get(url, headers=headers, proxies=proxies, timeout=20)
        return None

def fetch_html_advanced(url):
    """
    Función principal para obtener HTML usando el cliente avanzado
    """
    client = AdvancedHTTPClient()
    return client.fetch_with_retry(url)

