#!/bin/bash
echo "Vérification de l'installation de LibreOffice..."
if command -v soffice >/dev/null 2>&1; then
    echo "✅ LibreOffice est correctement installé: $(which soffice)"
    # Tester si LibreOffice fonctionne correctement
    soffice --version || echo "⚠️ LibreOffice est installé mais ne démarre pas correctement"
else
    echo "❌ LibreOffice n'est pas installé ou n'est pas dans le PATH!"
    # Rechercher LibreOffice dans les emplacements courants
    SOFFICE_PATH=$(find /opt -name soffice -type f 2>/dev/null | head -1)
    if [ -n "$SOFFICE_PATH" ]; then
        echo "✅ LibreOffice trouvé à: $SOFFICE_PATH"
        ln -sf $SOFFICE_PATH /usr/local/bin/soffice
        echo "Lien symbolique créé vers $SOFFICE_PATH"
    fi
fi

# Définir le chemin vers LibreOffice pour Carbone.js
export LIBREOFFICE_PATH=$(which soffice)
echo "LibreOffice path: $LIBREOFFICE_PATH"

# Vérifier que bcrypt fonctionne correctement
echo "Vérification de l'installation de bcrypt..."
node -e "
const bcrypt = require('bcrypt');
console.log('✅ bcrypt version:', bcrypt.version || 'installé');

// Test de fonctionnement de bcrypt
async function testBcrypt() {
  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('admin', salt);
    console.log('✅ Hachage bcrypt généré avec succès:', hash.substring(0, 20) + '...');
    
    const isValid = await bcrypt.compare('admin', hash);
    if (isValid) {
      console.log('✅ Vérification bcrypt réussie!');
    } else {
      console.error('❌ Échec de la vérification bcrypt');
      process.exit(1);
    }
  } catch (err) {
    console.error('❌ ERREUR CRITIQUE BCRYPT:', err);
    process.exit(1);
  }
}

testBcrypt();
" || { echo "❌ ERREUR CRITIQUE: bcrypt ne fonctionne pas correctement!"; exit 1; }

echo "Attente de la disponibilité de MongoDB..."
until nc -z mongodb 27017; do
  echo "En attente de MongoDB..."
  sleep 1
done
echo "MongoDB est disponible, initialisation de l'utilisateur admin..."

# Exécuter le script d'initialisation de l'utilisateur admin
node scripts/init-admin.js
if [ $? -ne 0 ]; then
  echo "❌ ERREUR: L'initialisation de l'utilisateur admin a échoué."
  echo "Tentative de réinitialisation avec le script de secours..."
  node scripts/admin-reset-tool.js admin admin
fi
echo "Initialisation de l'utilisateur admin terminée."

# Vérifier tous les chemins nécessaires
mkdir -p /app/templates
mkdir -p /app/temp
chmod -R 777 /app/templates
chmod -R 777 /app/temp

# Test des permissions d'écriture
if [ -w "/app/templates" ]; then
  echo "✅ Permissions d'écriture valides pour le dossier templates"
else
  echo "❌ ERREUR: Pas de permission d'écriture pour le dossier templates"
fi

if [ -w "/app/temp" ]; then
  echo "✅ Permissions d'écriture valides pour le dossier temp"
else
  echo "❌ ERREUR: Pas de permission d'écriture pour le dossier temp"
fi

# Initialisation des données fictives si nécessaire
echo "Vérification et initialisation des données..."
node scripts/init-data.js
echo "Vérification et initialisation des données terminées."

# Démarrage de l'application
echo "Démarrage du serveur Node.js"
node app.js