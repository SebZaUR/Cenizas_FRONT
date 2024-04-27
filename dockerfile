# Etapa de compilación
FROM node:latest AS builder

# Directorio de trabajo en la imagen
WORKDIR /app

# Copiar el archivo package.json y el archivo package-lock.json (si existe)
COPY package*.json ./

# Instalar las dependencias
RUN npm install phaser
RUN npm install

# Copiar el resto de los archivos del proyecto
COPY . .

# Compilar la aplicación
RUN npm run build --omit=dev

# Etapa de producción
FROM nginx:latest

# Copiar los archivos de la etapa de compilación a la imagen de Nginx
COPY --from=builder /app/dist/my-game /usr/share/nginx/html

# Exponer el puerto 80 para que pueda ser accedido desde fuera del contenedor
EXPOSE 80

# Comando para iniciar el servidor Nginx
CMD ["nginx", "-g", "daemon off;"]
