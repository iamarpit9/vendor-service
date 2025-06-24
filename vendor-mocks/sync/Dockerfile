FROM node:18
WORKDIR /
COPY package*.json ./
RUN npm install --cache=/tmp/npm-cache --prefer-offline --no-audit || cat /tmp/npm-cache/_logs/*-debug-0.log

COPY . .
CMD ["node", "vendor-mocks/sync/index.js"]
