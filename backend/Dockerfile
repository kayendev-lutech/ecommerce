FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build && npx tsc-alias

EXPOSE 8000

ENV NODE_PATH=/app/dist

# Auto migrate and seed when container start, after run server
CMD sh -c "\
  npx wait-port db:5432 && \
  npx tsx node_modules/typeorm/cli.js migration:run -d dist/config/typeorm.config.js && \
  node dist/database/seeds/001-roles.seed.js && \
  node dist/database/seeds/002-users.seed.js && \
  node dist/database/seeds/003-categories.seed.js && \
  node dist/database/seeds/004-products.seed.js && \
  node dist/database/seeds/005-variants.seed.js && \
  node dist/database/seeds/006-tokens.seed.js && \
  npm run docker:seed && \
  node dist/server.js"