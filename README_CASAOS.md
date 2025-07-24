# Peliculas - Flask + React para CasaOS

Este proyecto es una aplicación web de streaming construida con **Flask (Python)** para el backend y **React + Vite** para el frontend. Este README te guía para desplegar la app fácilmente en **CasaOS** usando Docker.

**Novedad:** Ahora las páginas de detalle de series y animes muestran géneros, póster y año igual que las películas, gracias a la paridad de metadatos en la API.

---

## 🚀 Despliegue rápido en CasaOS

### 1. Clona el repositorio y entra a la carpeta del backend
```bash
cd /ruta/a/peliculas/Proyecto
```

### 2. Construye la imagen Docker
```bash
docker build -t peliculas-casaos .
```

### 3. Ejecuta el contenedor
```bash
docker run -d --name peliculas -p 1234:1234 peliculas-casaos
```

- Accede a la app desde cualquier dispositivo en tu red:  
  `http://<IP_DE_TU_SERVIDOR>:1234`

---

## 🐳 Ejemplo de docker-compose.yml

```yaml
version: "3.8"
services:
  peliculas:
    build: .
    container_name: peliculas
    ports:
      - "1234:1234"
    restart: unless-stopped
    # volumes:
    #   - ./data:/app/data  # Descomenta si necesitas persistencia
```

---

## 📁 Estructura recomendada

```
peliculas/
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

---

## Cambios recientes importantes

- La paginación ahora utiliza rutas limpias (`/page/2`) en vez de parámetros de query (`?page=2`).
- El backend Flask sirve el frontend como SPA, permitiendo navegación directa a cualquier ruta.
- Cada ítem del catálogo ahora incluye un campo `url` generado automáticamente.
- **¡Nuevo!** Los endpoints de series (`/api/serie/<slug>`) y animes (`/api/anime/<slug>`) ahora devuelven metadatos enriquecidos: géneros, imagen de póster, año/fecha de estreno y sinopsis, igualando la calidad de información de las películas.

## Ejemplo de URLs

- Página principal: `http://localhost:1234/page/1`
- Página 2 del catálogo: `http://localhost:1234/page/2`
- Filtros y búsqueda: `http://localhost:1234/page/2?search=accion&section=Películas`

---

## ⚙️ Variables de entorno
- El puerto es **siempre 1234**.
- El frontend detecta automáticamente la IP del servidor.
- Si necesitas variables personalizadas, puedes agregarlas en el Dockerfile o en el compose.

---

## 🛠️ Troubleshooting
- Si no ves la app en la red, revisa que el puerto 1234 esté abierto en tu firewall/router.
- Si cambias la estructura, asegúrate de que el build de React esté en `FrontEnd/dist`.
- Para logs:
  ```bash
  docker logs -f peliculas
  ```

---

## 📦 Actualización
1. Detén y elimina el contenedor:
   ```bash
   docker stop peliculas && docker rm peliculas
   ```
2. Vuelve a construir y ejecutar:
   ```bash
   docker build -t peliculas-casaos .
   docker run -d --name peliculas -p 1234:1234 peliculas-casaos
   ```

---

## 📚 Recursos
- [CasaOS Docs](https://docs.casaos.io/)
- [Ejemplo de CasaOS en Docker](https://github.com/dockur/casa)

---

¡Listo! Tu app estará disponible en tu red local y lista para usarse en CasaOS, Smart TV, móvil o cualquier navegador. 