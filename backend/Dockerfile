FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build && npx tsc-alias

FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 8000

ENV NODE_PATH=/app/dist

# HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
#     CMD node -e "Promise.all([ \
#         fetch('http://localhost:8000/health').then(r => r.ok), \
#         new Promise((resolve, reject) => { \
#             require('redis').createClient().ping((err, res) => err ? reject(err) : resolve(res)); \
#         }), \
#         new Promise((resolve, reject) => { \
#             require('amqplib').connect('amqp://rabbitmq').then(conn => conn.close()).then(() => resolve()).catch(reject); \
#         }) \
#     ]).catch(e => process.exit(1))"

# Wait for dependencies and start app
CMD sh -c "\
    npx wait-port rabbitmq:5672 && \
    npx wait-port redis:6379 && \
    npx wait-port db:5432 && \
    npx tsx node_modules/typeorm/cli.js migration:run -d dist/config/typeorm.config.js && \
    node dist/database/seeds/001-roles.seed.js && \
    node dist/database/seeds/002-users.seed.js && \
    node dist/database/seeds/003-categories.seed.js && \
    node dist/database/seeds/004-products.seed.js && \
    node dist/database/seeds/005-variants.seed.js && \
    node dist/database/seeds/006-tokens.seed.js && \
    node dist/database/seeds/007-order.seed.js && \
    node dist/database/seeds/008-order-item.seed.js && \
    node dist/database/seeds/009-category-attributes.seed.js && \
    node dist/database/seeds/010-category-attribute-options.seed.js && \
    node dist/database/seeds/011-product-attributes-values.seed.js && \
    node dist/database/seeds/012-variants-attributes-values.seed.js && \
    node dist/server.js"