# Web-Scrapping: Películas - Flask + React

Aplicación web para streaming y catálogo de películas y series, con backend en Flask (Python) y frontend en React + Vite. Pensada para despliegue sencillo en CasaOS mediante Docker, pero también utilizable localmente para desarrollo y pruebas.

## Características

- Catálogo de películas y series extraído de fuentes web
- Backend API RESTful con Flask
- Frontend moderno con React, Vite y TailwindCSS
- Paginación, filtrado y búsqueda en el catálogo
- Visualización de detalles y sinopsis
- Modal de reproducción de video (streaming)
- Extracción de iframes y enlaces de video
- Sistema de extractores modular y extensible
- Listo para despliegue en CasaOS vía Docker
- Pruebas unitarias y de integración incluidas

## Requisitos

- Python 3.8 o superior
- Node.js 18+ y npm
- Docker y docker-compose (opcional, para despliegue)
- (Recomendado) Entorno virtual para Python

## Instalación

1. Clona el repositorio:
   ```bash
   git clone <url-del-repo>
   cd Web-Scrapping
   ```

2. Crea un entorno virtual e instala dependencias del backend:
   ```bash
   cd backend
   python3 -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   ```

3. Instala dependencias del frontend:
   ```bash
   cd ../frontend/project
   npm install
   ```

## Uso

1. Ejecuta el backend:
   ```bash
   cd ../../backend
   python app.py
   ```

2. Ejecuta el frontend:
   ```bash
   cd ../frontend/project
   npm run dev
   ```

3. Accede a la app en tu navegador en `http://localhost:5173` (o el puerto que indique Vite).

## Estructura del Proyecto

```
Web-Scrapping/
│
├── backend/
│   ├── app.py
│   ├── config.py
│   ├── main.py
│   ├── requirements.txt
│   ├── utils/
│   └── extractors/
├── frontend/
│   ├── project/  # Código fuente React
│   └── dist/     # Build generado por Vite
├── docker/
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── .dockerignore
├── scripts/
│   └── deploy_casaos.ps1
├── tests/
│   ├── test.py
│   └── test.js
├── LICENSE
├── README_CASAOS.md
└── .gitignore
```

## Lógica de Extracción

- El backend utiliza extractores modulares en `backend/extractors/` para obtener información de diferentes fuentes web.
- El frontend consume la API REST y muestra los datos en una interfaz moderna y responsiva.

## Contribuir

Las contribuciones son bienvenidas. Por favor, sigue estos pasos:

1. Haz fork del repositorio
2. Crea una rama para tu feature (`git checkout -b feature/NuevaFeature`)
3. Commit tus cambios (`git commit -m 'Agrega NuevaFeature'`)
4. Push a la rama (`git push origin feature/NuevaFeature`)
5. Abre un Pull Request

## Licencia

Proyecto desarrollado por Alexander Martínez González (@UnfairAdventage).  
Este proyecto está bajo la Licencia MIT. Consulta el archivo `LICENSE` para más detalles. 