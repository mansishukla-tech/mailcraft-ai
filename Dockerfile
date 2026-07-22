# ---------- Stage 1: Build the React frontend ----------
FROM node:20-alpine AS client-build
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# ---------- Stage 2: Install server production dependencies ----------
FROM node:20-alpine AS server-build
WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci --omit=dev
COPY server/ ./

# ---------- Stage 3: Final runtime image ----------
FROM node:20-alpine
WORKDIR /app/server
ENV NODE_ENV=production
ENV PORT=8080

# Server code + prod node_modules
COPY --from=server-build /app/server ./
# Built React static files, served by Express from ./public
COPY --from=client-build /app/client/dist ./public

EXPOSE 8080
USER node
CMD ["node", "src/index.js"]
