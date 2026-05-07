# syntax=docker/dockerfile:1
FROM node:20-alpine AS dev

WORKDIR /app
COPY package.json yarn.lock ./
RUN --mount=type=cache,target=/usr/local/share/.cache/yarn \
    yarn install --frozen-lockfile

COPY . .

EXPOSE 3008
CMD ["sh", "-c", "npx vite build --watch & npx tsx watch server/index.ts & wait"]

# ---

FROM node:20-alpine AS builder

WORKDIR /app
COPY package.json yarn.lock ./
RUN --mount=type=cache,target=/usr/local/share/.cache/yarn \
    yarn install --frozen-lockfile

COPY . .
RUN yarn build

# ---

FROM node:20-alpine AS runner

WORKDIR /app
COPY package.json yarn.lock ./
RUN --mount=type=cache,target=/usr/local/share/.cache/yarn \
    yarn install --frozen-lockfile --production --ignore-optional

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/dist-server ./dist-server

ENV NODE_ENV=production
ENV PORT=3001
ENV UPLOAD_DIR=/data/uploads

RUN mkdir -p /data/uploads

EXPOSE 3001

CMD ["node", "dist-server/index.js"]
