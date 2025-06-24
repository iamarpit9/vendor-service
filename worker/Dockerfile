FROM node:18
WORKDIR /
COPY queue ./queue
COPY package*.json ./
RUN npm install --cache=/tmp/npm-cache --prefer-offline --no-audit || cat /tmp/npm-cache/_logs/*-debug-0.log
COPY . .
CMD ["node", "worker/index.js"]
