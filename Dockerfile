FROM node:24.14-alpine as builder

ENV NODE_ENV build
WORKDIR /app

COPY package*.json tsconfig.json nest-cli.json .env ./
RUN npm ci

COPY /src ./src/

RUN npm run build \
    && npm prune --production

#-------------

FROM node:24.14-alpine

ENV NODE_ENV production
WORKDIR /app

COPY --from=builder /app ./

CMD ["npm", "run", "start:prod"]