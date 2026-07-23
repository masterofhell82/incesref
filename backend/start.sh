#!/bin/bash

# Archivo de log
LOG_FILE="/var/log/startup.log"

# Función para registrar mensajes
log_message() {
    echo "[$(date)] $1" | tee -a $LOG_FILE
}

# Inicia la aplicación Flask y registra la fecha y hora de inicio
log_message "Iniciando la aplicación Flask..."

# Soporta ambos layouts:
# - Local con volumen: /app/app.py
# - Producción sin volumen: /app/backend/app.py
if [ -f "/app/app.py" ]; then
    APP_DIR="/app"
elif [ -f "/app/backend/app.py" ]; then
    APP_DIR="/app/backend"
else
    log_message "No se encontró app.py en /app ni en /app/backend."
    exit 1
fi

cd "$APP_DIR" || exit 1
uv run python app.py

if [ $? -eq 0 ]; then
    log_message "Aplicación Flask iniciada correctamente."
else
    log_message "Error al iniciar la aplicación Flask."
fi
