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
    libxinerama1 \
    libfontconfig1 \
    libdbus-glib-1-2 \
    libcairo2 \
    libcups2 \
    libglu1-mesa \
    libsm6 \
    libnspr4 \
    libnss3 \
    build-essential \
    python3 \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Télécharger et installer LibreOffice
RUN cd /tmp && \
    wget https://downloadarchive.documentfoundation.org/libreoffice/old/7.5.1.1/deb/x86_64/LibreOffice_7.5.1.1_Linux_x86-64_deb.tar.gz && \
    echo "Extraction de LibreOffice..." && \
    tar -zxf LibreOffice_7.5.1.1_Linux_x86-64_deb.tar.gz && \
    LIBREOFFICE_DIR=$(find . -maxdepth 1 -type d -name "LibreOffice*" | head -n 1) && \
    echo "Répertoire détecté: $LIBREOFFICE_DIR" && \
    cd "$LIBREOFFICE_DIR/DEBS" && \
    echo "Installation des paquets .deb..." && \
    dpkg -i *.deb || apt-get update && apt-get -f install -y && \
    cd /tmp && \
    rm -rf /tmp/LibreOffice* && \
    if command -v soffice >/dev/null 2>&1; then \
        echo "✅ LibreOffice installé avec succès: $(which soffice)"; \
    else \
        echo "⚠️ Création du lien symbolique pour soffice"; \
        SOFFICE_PATH=$(find /opt -name soffice -type f 2>/dev/null | head -1); \
        if [ -n "$SOFFICE_PATH" ]; then \
            ln -sf $SOFFICE_PATH /usr/local/bin/soffice; \
        fi; \
    fi

# Vérifier l'installation de LibreOffice
RUN command -v soffice >/dev/null 2>&1 && echo "✅ LibreOffice disponible: $(which soffice)" || echo "❌ LibreOffice introuvable"

# Créer les répertoires nécessaires
RUN mkdir -p /app/templates /app/temp /app/scripts

# Copier les fichiers package*.json
COPY package*.json ./

# Installer les dépendances Node.js DANS le conteneur
# Important: installation explicite de bcrypt dans le conteneur pour éviter les problèmes de compatibilité
RUN npm install --no-package-lock && \
    npm install bcrypt --no-package-lock && \
    # Vérification que bcrypt est correctement installé
    node -e "const bcrypt = require('bcrypt'); console.log('✅ bcrypt version:', bcrypt.version || 'installé'); \
    bcrypt.genSalt(10).then(salt => { \
      return bcrypt.hash('test', salt); \
    }).then(hash => { \
      console.log('✅ Test de hachage bcrypt réussi:', hash.substring(0, 20) + '...'); \
      return bcrypt.compare('test', hash); \
    }).then(result => { \
      console.log('✅ Test de vérification bcrypt réussi:', result); \
    }).catch(err => { \
      console.error('❌ ERREUR CRITIQUE: Bcrypt ne fonctionne pas:', err); \
      process.exit(1); \
    });"

# Copier le reste du code
COPY . .

# Copier le script d'entrée modifié avec vérification bcrypt
COPY docker-entrypoint.sh /app/docker-entrypoint.sh

RUN chmod +x /app/docker-entrypoint.sh

EXPOSE 5002

CMD ["/app/docker-entrypoint.sh"]