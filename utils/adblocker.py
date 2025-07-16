from bs4 import BeautifulSoup
import os
import re
from adblockparser import AdblockRules

def load_easylist_rules(filepath):
    rules = []
    with open(filepath, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            # Ignorar comentarios y reglas de excepción
            if not line or line.startswith(('!', '#', '[', '@@', '##', '#@#')):
                continue
            rules.append(line)
    return rules

EASYLIST_PATH = os.path.join(os.path.dirname(__file__), 'easylist.txt')
EASYLIST_RULES = load_easylist_rules(EASYLIST_PATH)
ADBLOCK_RULES = AdblockRules(EASYLIST_RULES)

def clean_html_ads(html):
    soup = BeautifulSoup(html, 'html.parser')
    # Eliminar scripts bloqueados
    for script in soup.find_all('script', src=True):
        src = script['src']
        if ADBLOCK_RULES.should_block(src, {'script': True}):
            script.decompose()
    # Eliminar iframes bloqueados
    for iframe in soup.find_all('iframe', src=True):
        src = iframe['src']
        if ADBLOCK_RULES.should_block(src, {'subdocument': True}):
            iframe.decompose()
    return str(soup) 