FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci || npm install --no-audit --no-fund
COPY src ./src
EXPOSE 4002
CMD ["npm", "start"]

