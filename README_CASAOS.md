# Peliculas - Flask + React para CasaOS

Este proyecto es una aplicación web de streaming construida con **Flask (Python)** para el backend y **React + Vite** para el frontend. Este README te guía para desplegar la app fácilmente en **CasaOS** usando Docker.

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
└── Proyecto/
    ├── app.py
    ├── requirements.txt
    ├── Dockerfile
    ├── ...
    ├── FrontEnd/
    │   ├── project/  # Código fuente React
    │   └── dist/     # Build generado por Vite
    └── ...
```

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