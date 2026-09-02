FROM node:20-alpine AS builder

WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY backend/package*.json ./

RUN npm install

COPY backend/ ./

ARG APP_NAME
RUN npm run build ${APP_NAME}

RUN npm prune --production

FROM node:20-alpine AS runner

WORKDIR /app

ARG APP_NAME
ENV APP_MAIN_FILE=dist/apps/${APP_NAME}/main.js

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY backend/package*.json ./

COPY shared/ /shared/

CMD ["sh", "-c", "node ${APP_MAIN_FILE}"]