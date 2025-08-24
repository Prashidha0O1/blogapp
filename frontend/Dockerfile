FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

# Remove .env.local to prevent it from overriding docker-compose environment variables
RUN rm -f .env.local

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]