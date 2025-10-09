FROM node:18-alpine

WORKDIR /app

# Instalar dependencias del sistema para Sharp
RUN apk add --no-cache \
    vips-dev \
    python3 \
    make \
    g++

# Copiar archivos de dependencias
COPY package*.json ./
COPY tsconfig.json ./

# Instalar dependencias
RUN npm ci --only=production

# Copiar código fuente
COPY src/ ./src/

# Compilar TypeScript
RUN npm run build

# Exponer puerto
EXPOSE 3002

# Comando de inicio
CMD ["npm", "start"]
