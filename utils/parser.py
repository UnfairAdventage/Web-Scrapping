def safe_text(element, default=''):
    return element.text.strip() if element else default