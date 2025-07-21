# PowerShell script para automatizar el despliegue de la app Flask+React en CasaOS
# Ejecuta este script desde la carpeta Proyecto

Write-Host "[1/4] Abriendo puerto 1234 en el firewall de Windows..."
New-NetFirewallRule -DisplayName "CasaOS Peliculas 1234" -Direction Inbound -LocalPort 1234 -Protocol TCP -Action Allow -Profile Any -ErrorAction SilentlyContinue

Write-Host "[2/4] Construyendo la imagen Docker..."
docker build -t peliculas-casaos .

Write-Host "[3/4] Deteniendo y eliminando contenedor anterior (si existe)..."
docker stop peliculas 2>$null

docker rm peliculas 2>$null

Write-Host "[4/4] Ejecutando el contenedor en segundo plano..."
docker run -d --name peliculas -p 1234:1234 peliculas-casaos

Write-Host "\n¡Listo! Accede a tu app en: http://$(hostname -I | %{ $_.Trim() } | Select-Object -First 1):1234" 