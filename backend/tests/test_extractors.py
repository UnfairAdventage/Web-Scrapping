import sys
import os
import unittest

# Añadir el path del backend para poder importar los extractores
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from extractors.generic_extractor import extraer_listado, extraer_info_pelicula

class TestExtractors(unittest.TestCase):

    def test_extraer_listado(self):
        # HTML de ejemplo simplificado de sololatino.net
        html_dummy = """
        <article class="item movies" data-id="123">
            <div class="poster">
                <img src="img.jpg" data-srcset="img_srcset.jpg" alt="Pelicula Prueba">
                <div class="data">
                    <h3>Pelicula Prueba</h3>
                    <p>2023</p>
                    <span>Accion</span>
                </div>
                <div class="audio">
                    <span class="latino">Latino</span>
                </div>
                <a href="https://sololatino.net/peliculas/prueba-slug"></a>
            </div>
        </article>
        """
        resultados = extraer_listado(html_dummy)
        
        self.assertEqual(len(resultados), 1)
        self.assertEqual(resultados[0]['titulo'], 'Pelicula Prueba')
        self.assertEqual(resultados[0]['slug'], 'prueba-slug')
        self.assertEqual(resultados[0]['year'], '2023')
        self.assertEqual(resultados[0]['tipo'], 'pelicula')
        self.assertEqual(resultados[0]['idioma'], 'Latino')

    def test_extraer_info_pelicula(self):
        html_dummy = """
        <div class="data">
            <h1>Titulo Pelicula</h1>
        </div>
        <div itemprop="description">
            <p>Esta es una sinopsis de prueba.</p>
        </div>
        <span itemprop="dateCreated">2023-01-01</span>
        <div class="sgeneros">
            <a href="#">Accion</a>
            <a href="#">Aventura</a>
        </div>
        <div class="poster">
            <img src="poster_grande.jpg">
        </div>
        """
        info = extraer_info_pelicula(html_dummy)
        
        self.assertEqual(info['titulo'], 'Titulo Pelicula')
        self.assertEqual(info['sinopsis'], 'Esta es una sinopsis de prueba.')
        self.assertEqual(info['fecha_estreno'], '2023-01-01')
        self.assertIn('Accion', info['generos'])
        self.assertIn('Aventura', info['generos'])

if __name__ == '__main__':
    unittest.main()
