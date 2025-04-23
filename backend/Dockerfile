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

# Supprimer les anciennes versions de LibreOffice (si présentes)
RUN apt-get update && \
    apt-get remove --purge -y libreoffice* && \
    apt-get autoremove --purge -y

# Installer les dépendances requises pour LibreOffice 7.5.1.1
RUN apt-get update && apt-get install -y \
    libxinerama1 \
    libfontconfig1 \
    libdbus-glib-1-2 \
    libcairo2 \
    libcups2 \
    libglu1-mesa \
    libsm6 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /tmp

# Copier le fichier LibreOffice depuis le contexte de build
COPY LibreOffice_7.5.1.1_Linux_x86-64_deb.tar.gz /tmp/

# Installer LibreOffice
RUN echo "Extracting LibreOffice..." && \
    tar -zxf LibreOffice_7.5.1.1_Linux_x86-64_deb.tar.gz && \
    echo "Listing extracted content:" && \
    ls -la && \
    cd LibreOffice_7.5.1.1.2_Linux_x86-64_deb/DEBS && \
    echo "Installing .deb packages..." && \
    dpkg -i --force-all *.deb || apt-get -f install -y && \
    cd /tmp && \
    rm -rf /tmp/LibreOffice*

WORKDIR /app

# Vérifier l'installation de LibreOffice
RUN echo "Verifying LibreOffice installation:" && \
    find /opt -name soffice -type f || echo "Not found in /opt" && \
    find /usr -name soffice -type f || echo "Not found in /usr"

# Copier les fichiers package*.json
COPY package*.json ./
RUN npm install

# Copier le reste du code
COPY . .

# Créer le script d'entrée
RUN echo '#!/bin/bash\n\
echo "Vérification de l'\''installation de LibreOffice..."\n\
SOFFICE_PATH=$(find /opt -name soffice -type f 2>/dev/null | head -1)\n\
\n\
if [ -n "$SOFFICE_PATH" ]; then\n\
    echo "✅ LibreOffice est correctement installé: $SOFFICE_PATH"\n\
    $SOFFICE_PATH --version\n\
    # Exporter pour Carbone.js\n\
    export LIBREOFFICE_PATH=$SOFFICE_PATH\n\
    # Créer un lien symbolique pour s'\''assurer que soffice est dans le PATH\n\
    ln -sf $SOFFICE_PATH /usr/local/bin/soffice\n\
else\n\
    echo "❌ LibreOffice n'\''est pas installé ou n'\''est pas trouvable!"\n\
    echo "Tentative de localisation..."\n\
    find / -name soffice -type f 2>/dev/null\n\
fi\n\
\n\
echo "Attente de la disponibilité de MongoDB..."\n\
until nc -z mongodb 27017; do\n\
  echo "En attente de MongoDB..."\n\
  sleep 1\n\
done\n\
echo "MongoDB est disponible, démarrage du serveur Node.js"\n\
\n\
# Vérifier tous les chemins nécessaires\n\
mkdir -p /app/templates\n\
mkdir -p /app/temp\n\
chmod -R 777 /app/templates\n\
chmod -R 777 /app/temp\n\
\n\
# Exécuter avec NODE_ENV défini\n\
node app.js' > /app/docker-entrypoint.sh

RUN chmod +x /app/docker-entrypoint.sh

EXPOSE 5002

CMD ["/app/docker-entrypoint.sh"]