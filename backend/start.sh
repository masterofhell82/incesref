#!/bin/bash

# Archivo de log
LOG_FILE="/var/log/startup.log"

# Función para registrar mensajes
log_message() {
    echo "[$(date)] $1" | tee -a $LOG_FILE
}

# Inicia la aplicación Flask y registra la fecha y hora de inicio
log_message "Iniciando la aplicación Flask..."

uv run app.py

if [ $? -eq 0 ]; then
    log_message "Aplicación Flask iniciada correctamente."
else
    log_message "Error al iniciar la aplicación Flask."
fi
