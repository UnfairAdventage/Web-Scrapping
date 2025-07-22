# Etapa 1: Build del frontend (React + Vite)
FROM node:20-alpine AS frontend-build

WORKDIR /app/frontend/project
COPY ../frontend/project/ ./
RUN npm install && npm run build

# Etapa 2: Backend Python + servir frontend
FROM python:3.11-slim

# Instala dependencias del sistema necesarias para adblockparser y scraping
RUN apt-get update && apt-get install -y build-essential libglib2.0-0 libsm6 libxext6 libxrender-dev && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copia el backend
COPY ../backend/ ./backend/

# Copia el build del frontend al lugar donde Flask lo sirve
COPY --from=frontend-build /app/frontend/project/dist ./frontend/dist

# Copia archivos de configuración y requirements
COPY ../backend/requirements.txt ./backend/requirements.txt
COPY ../backend/app.py ./backend/app.py
COPY ../backend/config.py ./backend/config.py
COPY ../backend/main.py ./backend/main.py

# Instala dependencias Python
RUN pip install --no-cache-dir -r ./backend/requirements.txt

# Expón el puerto para CasaOS
EXPOSE 1234

# Comando para arrancar Flask
CMD ["python", "-m", "backend.app"]