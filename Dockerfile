### STAGE 1: Build ###    
# We label our stage as 'builder'
FROM node:19-alpine as builder

# Maintainer and description labels
LABEL maintainer="support@forus.io"
LABEL description="Forus platform (frontend), used for creating docker image"

# Update apk and install build dependencies
RUN apk update \
&& apk --no-cache --virtual build-dependencies add python3 make g++

# Configure npm settings and clean cache
RUN npm set progress=false && npm config set depth 0 && npm cache clean --force

# Set working directory
WORKDIR /ng-app

# Copy source files to the container
COPY ./ src

# Set working directory
WORKDIR /ng-app/src

# Create env.js from env.example.js if it doesn't exist, then install npm dependencies and build the project
RUN if [ ! -f env.js ]; then cp env.example.js env.js; fi
RUN npm install && npm run build

### STAGE 2: Setup apache2 ###
# Use the official Apache HTTP Server image
FROM httpd:2.4

# Set the Apache document root
ENV APACHE_DOCUMENT_ROOT=/usr/local/apache2/htdocs

# Copy custom Apache configuration files
COPY docker/docker-compose/apache2/httpd.conf /usr/local/apache2/conf/httpd.conf
COPY docker/docker-compose/apache2/httpd-vhosts.conf /usr/local/apache2/conf/extra/httpd-vhosts.conf

# Remove default Apache document root contents
RUN rm -rf /usr/local/apache2/htdocs/*

# Copy built files from the builder stage to the Apache document root
COPY --from=builder /ng-app/src/dist /usr/local/apache2/htdocs