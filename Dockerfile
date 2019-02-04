FROM node:10
WORKDIR '/var/www/app'
RUN npm i pm2 -g
