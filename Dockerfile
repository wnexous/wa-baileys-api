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

RUN npx prisma migrate dev -n wa-baileys-api

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
