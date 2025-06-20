FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# Serve stage
FROM node:22-alpine

WORKDIR /app

# Install static file server
RUN npm install -g serve

# Copy only the built files
COPY --from=build /app/dist ./dist

EXPOSE 3000

CMD ["serve", "-s", "dist"]
