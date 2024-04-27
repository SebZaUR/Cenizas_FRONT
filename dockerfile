# Etapa de construcción
FROM node:20.11.0 as build-step

# Crear directorio de la aplicación
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Copiar los archivos de dependencias e instalarlas
COPY package.json /usr/src/app
RUN npm install

# Copiar el resto de los archivos y compilar la aplicación
COPY . /usr/src/app
RUN npm run build --prod

# Etapa de producción
FROM nginx:latest

# Copiar los archivos compilados a NGINX
COPY --from=build-step /usr/src/app/dist/cenizasdelpasado /usr/share/nginx/html
