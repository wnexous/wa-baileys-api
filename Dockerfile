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
echo "Waiting for database to be ready..."\n\
sleep 5\n\
echo "Creating database schema..."\n\
npx prisma db push --accept-data-loss\n\
echo "Starting application..."\n\
exec "$@"' > /app/docker-entrypoint.sh && \
chmod +x /app/docker-entrypoint.sh

# Expose port
EXPOSE 3000

# Set entrypoint
ENTRYPOINT ["/app/docker-entrypoint.sh"]

# Start the application
CMD ["npm", "start"]
