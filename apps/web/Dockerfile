# Next.js Web Dockerfile
FROM node:20-bookworm-slim AS base
WORKDIR /app

COPY package.json package-lock.json* tsconfig.base.json ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/web/package.json ./apps/web/

RUN npm install

COPY packages/shared ./packages/shared
COPY apps/web ./apps/web

RUN npm run build -w packages/shared || true
RUN npm run build -w apps/web || true

USER node
EXPOSE 3000

CMD ["npm", "run", "start", "-w", "apps/web"]
