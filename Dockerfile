FROM node:slim

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci

# Copy source code
COPY . .

RUN apt-get update -y \
&& apt-get install -y openssl

# Generate Prisma client
RUN npm run prisma:generate

# Build TypeScript
RUN npm run build

# Create entrypoint script
RUN echo '#!/bin/sh\n\
echo "Running database migrations..."\n\
npx prisma migrate deploy\n\
echo "Starting application..."\n\
exec "$@"' > /app/docker-entrypoint.sh && \
chmod +x /app/docker-entrypoint.sh

# Expose port
EXPOSE 3000

# Set entrypoint
ENTRYPOINT ["/app/docker-entrypoint.sh"]

# Start the application
CMD ["npm", "start"]
