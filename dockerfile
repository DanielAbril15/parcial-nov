# --- Imagen base ligera ---
FROM node:20-slim

# Configuración del entorno
ENV NODE_ENV=production
WORKDIR /app

# Instala utilidades mínimas (para healthcheck, opcional)
RUN apt-get update && apt-get install -y --no-install-recommends curl \
  && rm -rf /var/lib/apt/lists/*

# Copia dependencias primero (para aprovechar la caché)
COPY package*.json ./

# Instala dependencias de producción
RUN npm ci --omit=dev

# Copia el código del proyecto
COPY . .

# Crea usuario no root (buena práctica)
RUN useradd -m appuser && chown -R appuser:appuser /app
USER appuser

# Expón los puertos internos de tus microservicios
EXPOSE 3010 3020 

# Healthcheck (opcional, verifica el primer micro)
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD curl -fsS "http://localhost:3010/" > /dev/null || exit 1

# Comando de arranque
CMD ["npm", "start"]

