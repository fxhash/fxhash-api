FROM node:16-alpine

ENV NODE_ENV=dev

# helper tool for waiting for postgres to finish init before starting api container
ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.9.0/wait /wait
RUN chmod +x /wait

WORKDIR /app
COPY package.json /app
COPY yarn.lock /app
RUN yarn install
COPY . /app
CMD npm run start
EXPOSE 4000
