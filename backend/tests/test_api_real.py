import sys
import os
import unittest

# Asegurar que el directorio raíz del proyecto esté en el path
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from backend.app import app

class TestAPIIntegration(unittest.TestCase):
    def setUp(self):
        self.app = app.test_client()
        self.app.testing = True

    def test_busqueda_real(self):
        """Prueba real de búsqueda contra el servidor de sololatino"""
        # Usamos una palabra común para asegurar resultados
        response = self.app.get('/api/listado?busqueda=spider')
        data = response.get_json()

        print(f"\n[DEBUG] Búsqueda real 'spider': {len(data.get('resultados', []))} resultados encontrados.")
        
        self.assertEqual(response.status_code, 200)
        self.assertIn('resultados', data)
        self.assertEqual(data['seccion'], 'Busqueda')
        
        # Si hay resultados (que debería), verificamos la estructura
        if data['resultados']:
            item = data['resultados'][0]
            self.assertIn('title', item)
            self.assertIn('slug', item)
            self.assertIn('type', item)

    def test_listado_peliculas_real(self):
        """Prueba real de scraping de la sección Películas"""
        response = self.app.get('/api/listado?seccion=Peliculas&pagina=1')
        data = response.get_json()

        print(f"[DEBUG] Listado real 'Películas': {len(data.get('resultados', []))} resultados encontrados.")

        self.assertEqual(response.status_code, 200)
        self.assertIn('resultados', data)
        self.assertEqual(data['seccion'], 'Películas')
        
        if data['resultados']:
            item = data['resultados'][0]
            self.assertIn('titulo', item)
            self.assertIn('slug', item)
            self.assertIn('url', item)

    def test_listado_series_real(self):
        """Prueba real de scraping de la sección Series"""
        response = self.app.get('/api/listado?seccion=Series&pagina=1')
        data = response.get_json()

        print(f"[DEBUG] Listado real 'Series': {len(data.get('resultados', []))} resultados encontrados.")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(data['seccion'], 'Series')
        self.assertTrue(len(data['resultados']) > 0)

if __name__ == '__main__':
    unittest.main()
