FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# URL de l'API dans un environnement proxyfié
RUN echo "REACT_APP_API_URL=/api" > .env

RUN npm run build

FROM nginx:alpine

# Configuration nginx simple pour HTTP
COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]