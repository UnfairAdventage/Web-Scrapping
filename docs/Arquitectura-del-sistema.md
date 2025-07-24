# Anxerstudios-Streaming Docs

## Arquitectura del sistema

Este documento proporciona una descripción general completa de la arquitectura de múltiples niveles de la aplicación Anxerstudios-Streaming, que cubre el frontend de React, el backend de Flask, la canalización de web scraping y la estrategia de contenedorización de Docker. El sistema está diseñado como una implementación de un solo contenedor que agrega contenido multimedia en tiempo real a través del web scraping y lo presenta a través de una interfaz web moderna.\

Para conocer detalles específicos de implementación de componentes individuales, consulte [Arquitectura frontend](), [Arquitectura del backend](), y [Arquitectura de implementación](). Para conocer los procedimientos operativos y de configuración, consulte [Primeros pasos]().

### Descripción general del sistema central

La aplicación Anxerstudios-Streaming implementa una arquitectura de tres niveles dentro de un único contenedor Docker, optimizada para la implementación de CasaOS. El sistema agrega contenido multimedia de fuentes externas a través de web scraping y lo presenta a través de una interfaz React responsiva.

### Niveles del sistema y flujo de comunicación

![Niveles del sistema y flujo de comunicación](./imgs/Niveles%20del%20sistema%20y%20flujo%20de%20comunicación.png)

### Arquitectura de procesamiento de solicitudes

El sistema procesa las solicitudes de los usuarios a través de una aplicación Flask unificada que sirve tanto a puntos finales de API como a activos estáticos, implementando un patrón de servidor híbrido SPA/API.

### Mapeo de rutas API y funciones de controlador
![Mapeo de rutas API y funciones de controlador](./imgs/Mapeo%20de%20rutas%20API%20y%20funciones%20de%20controlador.png)

### Flujo de datos y canalización de procesamiento

La aplicación implementa una canalización de web scraping que transforma contenido HTML externo en respuestas JSON estructuradas para el frontend.

### Flujo de extracción y transformación de contenido
![Flujo de extracción y transformación de contenido](./imgs/Flujo%20de%20extracción%20y%20transformación%20de%20contenido.png)

### Arquitectura de construcción y tiempo de ejecución de contenedores

El sistema utiliza una compilación Docker de varias etapas para optimizar tanto el tiempo de compilación como el tamaño de la imagen final, separando la compilación del frontend del tiempo de ejecución del backend.

### Proceso de construcción en varias etapas