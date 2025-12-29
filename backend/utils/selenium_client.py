"""
Cliente Selenium para superar protecciones anti-bot muy estrictas
"""

import time
import random
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.service import Service

def fetch_html_selenium(url, headless=True):
    """
    Obtiene HTML usando Selenium con Chrome
    """
    options = Options()
    
    if headless:
        options.add_argument('--headless')
    
    # Opciones para evitar detección
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    options.add_argument('--disable-blink-features=AutomationControlled')
    options.add_experimental_option("excludeSwitches", ["enable-automation"])
    options.add_experimental_option('useAutomationExtension', False)
    options.add_argument('--disable-extensions')
    options.add_argument('--disable-plugins')
    options.add_argument('--disable-images')
    options.add_argument('--disable-javascript')
    options.add_argument('--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
    
    driver = None
    try:
        # Instalar ChromeDriver automáticamente
        service = Service(ChromeDriverManager().install())
        driver = webdriver.Chrome(service=service, options=options)
        
        # Ejecutar script para ocultar webdriver
        driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
        
        print(f"[SELENIUM] Navegando a {url}")
        driver.get(url)
        
        # Esperar a que cargue la página
        time.sleep(random.uniform(3, 7))
        
        # Verificar si hay error 403
        if "403" in driver.page_source or "Forbidden" in driver.page_source:
            print("[SELENIUM] Error 403 detectado")
            return None
        
        # Esperar a que aparezcan elementos de contenido
        try:
            WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.TAG_NAME, "body"))
            )
        except:
            print("[SELENIUM] Timeout esperando contenido")
        
        html = driver.page_source
        print(f"[SELENIUM] HTML obtenido: {len(html)} caracteres")
        
        return html
        
    except Exception as e:
        print(f"[SELENIUM] Error: {e}")
        return None
    finally:
        if driver:
            driver.quit()

