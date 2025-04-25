FROM node:20-alpine AS build

WORKDIR /app

# Copier d'abord les fichiers package*.json pour tirer parti du cache Docker
COPY package*.json ./
RUN npm install

# Copier le reste des fichiers sources
COPY . .

# Créer un fichier .env sur mesure pour la build de production
RUN echo "REACT_APP_API_URL=http://localhost:5002/api" > .env

# Compiler l'application React
RUN npm run build

# Étape de production avec Nginx
FROM nginx:alpine

# Copier la configuration Nginx personnalisée
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copier les fichiers compilés depuis l'étape de build
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]