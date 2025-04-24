FROM ubuntu:22.04

# Éviter les questions interactives pendant l'installation
ENV DEBIAN_FRONTEND=noninteractive

# Installer Node.js et les dépendances nécessaires
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    gnupg \
    netcat \
    iputils-ping \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copier les fichiers package*.json
COPY package*.json ./
RUN npm install

# Copier le reste du code
COPY . .

# Copier le script d'entrée et d'initialisation
COPY docker-entrypoint.sh /app/docker-entrypoint.sh

RUN chmod +x /app/docker-entrypoint.sh

EXPOSE 5002

CMD ["/app/docker-entrypoint.sh"]