#!/bin/bash

# Variables
CONTAINER_NAME="postgresdb"
DB_NAME="incesdev"
DB_USER="postgres"
BACKUP_DIR="/home/inces/backup"
LOG_FILE="$BACKUP_DIR/backup_$(date +'%Y-%m-%d_%H-%M-%S').log"
BACKUP_FILE="$BACKUP_DIR/backup_$(date +'%Y-%m-%d_%H-%M-%S').sql"
BACKUP_FILE_GZ="$BACKUP_FILE.gz"

# Crear el directorio de respaldo si no existe
mkdir -p $BACKUP_DIR

# Función para registrar mensajes en el log
log() {
    echo "$(date +'%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

# Verificar si el contenedor está en ejecución
if ! docker ps --format '{{.Names}}' | grep -q "^$CONTAINER_NAME$"; then
    log "❌ Error: El contenedor '$CONTAINER_NAME' no esta en ejecucion."
    exit 1
fi

# Ejecutar el respaldo y guardar en un archivo SQL
if docker exec -t "$CONTAINER_NAME" pg_dump -U "$DB_USER" -d "$DB_NAME" > "$BACKUP_FILE"; then
    log "✅ Respaldo completado con exito: $BACKUP_FILE"
else
    log "❌ Error al realizar el respaldo."
    exit 1
fi

# Comprimir el archivo SQL
if gzip "$BACKUP_FILE"; then
    log "✅ Archivo comprimido: $BACKUP_FILE_GZ"
else
    log "❌ Error al comprimir el archivo."
    exit 1
fi
