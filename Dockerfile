# Tianhai Information Technology
# Oujiang College OA Fetcher

# do not forget to define environment vars
# REDIS_URL MONGO_URL

FROM node:8.12.0-alpine
LABEL maintainer="Soha Jin <soha@lohu.info>"

ENV LC_ALL=C.UTF-8
ENV PORT=80
RUN mkdir -p /app
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .
RUN cp config.js.docker config.js

EXPOSE 80
CMD ["node","./index.js"]
