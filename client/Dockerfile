FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Créer le fichier .env avec la bonne URL
RUN echo "REACT_APP_API_URL=/api" > .env

RUN npm run build

FROM nginx:alpine

# Copier la configuration nginx basique
COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]