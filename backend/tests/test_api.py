import sys
import os
import unittest
from unittest.mock import patch, MagicMock

# Asegurar que el directorio raíz del proyecto esté en el path para las importaciones de 'backend.*'
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from backend.app import app

class TestAPIListado(unittest.TestCase):
    def setUp(self):
        self.app = app.test_client()
        self.app.testing = True

    @patch('backend.app.requests.get')
    def test_busqueda_exitosa(self, mock_get):
        # Simular respuesta JSON de la API de sololatino
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "123": {
                "title": "Pelicula de Prueba",
                "url": "https://sololatino.net/peliculas/prueba-slug",
                "img": "img.jpg",
                "type": "pelicula",
                "extra": {"date": "2023"}
            }
        }
        mock_get.return_value = mock_response

        response = self.app.get('/api/listado?busqueda=prueba')
        data = response.get_json()

        self.assertEqual(response.status_code, 200)
        self.assertEqual(data['seccion'], 'Busqueda')
        self.assertEqual(len(data['resultados']), 1)
        self.assertEqual(data['resultados'][0]['title'], 'Pelicula de Prueba')
        self.assertEqual(data['resultados'][0]['slug'], 'prueba-slug')
        self.assertEqual(data['resultados'][0]['type'], 'movie')

    @patch('backend.app.fetch_html')
    def test_listado_seccion_exitosa(self, mock_fetch):
        # Simular HTML para el listado de una sección
        mock_fetch.return_value = """
        <article class="item movies" data-id="456">
            <div class="poster">
                <img src="img2.jpg" data-srcset="img2_srcset.jpg" alt="Pelicula Seccion">
                <div class="data">
                    <h3>Pelicula Seccion</h3>
                    <p>2022</p>
                </div>
                <a href="https://sololatino.net/peliculas/seccion-slug"></a>
            </div>
        </article>
        """
        
        # Probamos la sección "Peliculas" (que es una de las configuradas en TARGET_URLS)
        response = self.app.get('/api/listado?seccion=Peliculas&pagina=1')
        data = response.get_json()

        self.assertEqual(response.status_code, 200)
        self.assertEqual(data['seccion'], 'Películas') # El nombre real en TARGET_URLS parece tener tilde
        self.assertTrue(len(data['resultados']) > 0)
        self.assertEqual(data['resultados'][0]['titulo'], 'Pelicula Seccion')
        self.assertEqual(data['resultados'][0]['slug'], 'seccion-slug')

    def test_seccion_no_encontrada(self):
        response = self.app.get('/api/listado?seccion=SeccionInexistente')
        self.assertEqual(response.status_code, 404)
        data = response.get_json()
        self.assertIn('error', data)

if __name__ == '__main__':
    unittest.main()
