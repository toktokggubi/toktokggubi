# Stage 1: Development - For hot-reloading with docker-compose.dev.yml
FROM node:22-alpine AS development
WORKDIR /app
# Copy package.json and install dependencies
COPY package.json package-lock.json ./
RUN npm install
# Copy all source code (will be mounted over in dev mode)
COPY . .
EXPOSE 3000
# Default command for development, will be overridden by docker-compose.dev.yml
CMD ["npm", "run", "dev"]

# Stage 2: Production Build - Builds the optimized React app
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install --omit=dev # Install production dependencies
COPY . .
RUN npm run build # Build the React app for production

# Stage 3: Production Serve - Serves the built React app using Nginx
FROM nginx:alpine AS production
# Copy the built React static files from the 'build' stage
COPY --from=build /app/build /usr/share/nginx/html
# Copy a minimal Nginx configuration to serve the frontend static files
# This config is specific to the frontend container, not the main proxy Nginx
COPY ./nginx.prod.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
