FROM node:18
WORKDIR /
COPY package*.json ./
COPY queue ./queue
COPY db ./db
RUN npm install --cache=/tmp/npm-cache --prefer-offline --no-audit || cat /tmp/npm-cache/_logs/*-debug-0.log

COPY . .
CMD ["node", "api/index.js"]
