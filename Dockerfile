### STAGE 1: Build ###
FROM node:19-alpine as builder

LABEL maintainer="support@forus.io"
LABEL description="Forus platform frontend"

RUN apk update \
    && apk --no-cache --virtual build-dependencies add \
    python3 \
    make \
    g++

RUN npm i
RUN npm run build

### STAGE 2: Configure apache ###
FROM httpd:2.4

ENV APACHE_DOCUMENT_ROOT=/usr/local/apache2/htdocs
COPY docker/docker-compose/apache2/httpd.conf /usr/local/apache2/conf/httpd.conf
COPY docker/docker-compose/apache2/httpd-vhosts.conf /usr/local/apache2/conf/extra/httpd-vhosts.conf

RUN rm -rf /usr/local/apache2/htdocs/*

COPY --from=builder /dist /usr/local/apache2/htdocs