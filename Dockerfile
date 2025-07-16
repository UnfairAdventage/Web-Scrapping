# Etapa 1: Build del frontend (React + Vite)

FROM ubuntu:latest

RUN apt update && apt upgrade -y && apt install python3 -y && apt install npm -y
RUN git clone https://github.com/UnfairAdventage/Web-Scrapping.git

FROM node:20-alpine AS frontend-build

WORKDIR /app/frontend
COPY FrontEnd/project/ ./
RUN npm install && npm run build

# Etapa 2: Backend Python + servir frontend
FROM python:3.11-slim

# Instala dependencias del sistema necesarias para adblockparser y scraping
RUN apt-get update && apt-get install -y build-essential libglib2.0-0 libsm6 libxext6 libxrender-dev && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copia el backend
COPY . .

# Copia el build del frontend al lugar donde Flask lo sirve
COPY --from=frontend-build /app/frontend/dist ./FrontEnd/dist

# Instala dependencias Python
RUN pip install --no-cache-dir -r requirements.txt

# Expón el puerto para CasaOS
EXPOSE 1234

# Comando para arrancar Flask
CMD ["python", "app.py"]