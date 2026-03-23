#!/bin/bash

# Variables
CONTAINER_NAME="streams_db"
#"postgresdb"
DB_NAME="incesdev"
DB_USER="postgres"

# Recibe el archivo de respaldo como argumento
if [ -z "$1" ]; then
    echo "❌ Error: Debes indicar el archivo de respaldo (.sql.gz) como argumento."
    echo "Ejemplo: $0 /home/inces/backup/backup_2025-08-05_12-00-00.sql.gz"
    exit 1
fi
BACKUP_FILE_GZ="$1"

# Verificar si el contenedor está en ejecución
if ! docker ps --format '{{.Names}}' | grep -q "^$CONTAINER_NAME$"; then
    echo "❌ Error: El contenedor '$CONTAINER_NAME' no está en ejecución."
    exit 1
fi

# Verificar si el archivo de respaldo existe
if [ ! -f "$BACKUP_FILE_GZ" ]; then
    echo "❌ Error: El archivo de respaldo '$BACKUP_FILE_GZ' no existe."
    exit 1
fi

# Restaurar la base de datos
if gunzip -c "$BACKUP_FILE_GZ" | docker exec -i "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME"; then
    echo "✅ Restauración completada con éxito."
else
    echo "❌ Error al restaurar la base de datos."
    exit 1
fi
