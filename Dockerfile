### STAGE 1: Build ###    
FROM node:19-alpine AS builder

LABEL maintainer="support@forus.io"
LABEL description="Forus platform (frontend), used for creating docker image"

RUN apk update \
&& apk --no-cache --virtual build-dependencies add python3 make g++

RUN npm set progress=false && npm config set depth 0 && npm cache clean --force

WORKDIR /ng-app

COPY ./ src

WORKDIR /ng-app/src

RUN if [ ! -f env.js ]; then cp env.example.js env.js; fi
RUN npm install && npm run build

### STAGE 2: Setup apache2 ###
FROM httpd:2.4

RUN apt-get update && apt-get install -y wget

# Set the Apache document root
ENV APACHE_DOCUMENT_ROOT=/usr/local/apache2/htdocs

# Copy custom Apache configuration files
COPY docker/docker-compose/apache_conf/httpd.conf /usr/local/apache2/conf/httpd.conf
COPY docker/docker-compose/apache_conf/httpd-vhosts.conf /usr/local/apache2/conf/extra/httpd-vhosts.conf

# Remove default Apache document root contents
RUN rm -rf /usr/local/apache2/htdocs/*

# Copy built files from the builder stage to the Apache document root
COPY --from=builder /ng-app/src/dist /usr/local/apache2/htdocs