# Usa una imagen base de Python, elige la versión adecuada para tu aplicación
FROM python:3.12-slim-bullseye

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

RUN apt-get update \
	&& apt-get install -y nano telnet cron build-essential gcc libpq-dev wkhtmltopdf \
	&& rm -rf /var/lib/apt/lists/*

# Copia el archivo requirements.txt al contenedor
COPY ./backend/requirements.txt .


# Instala uv (instalador rápido de paquetes Python)
RUN pip install --upgrade pip && pip install uv
# Instala las dependencias de Python usando uv
RUN uv pip install --system -r requirements.txt

# Copia el código de la aplicación Flask al contenedor
COPY . .

# Copia el script de inicio al contenedor
COPY ./backend/start.sh /start.sh
RUN chmod +x /start.sh

# Expone el puerto en el que se ejecuta la aplicación Flask
EXPOSE 3010
EXPOSE 465
EXPOSE 587

# Comando para ejecutar el script de inicio
CMD ["/start.sh"]
