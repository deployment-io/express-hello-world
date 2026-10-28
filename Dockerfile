FROM node:22-bookworm-slim

WORKDIR /app
ENV NODE_ENV=production

# Install dependencies first so they're cached when only the code changes.
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production && yarn cache clean

COPY . .

USER node
EXPOSE 3001
CMD ["node", "app.js"]
