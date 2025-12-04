# Etapa 1: Construcción de dependencias
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

# Etapa 2: Imagen final
FROM node:20-alpine

WORKDIR /app

# Crear usuario no-root por seguridad
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

# Copiar node_modules desde la etapa anterior
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules

# Copiar el código de la aplicación
COPY --chown=nodejs:nodejs . .

# Cambiar al usuario nodejs
USER nodejs

EXPOSE 8080

CMD ["npm", "start"]
