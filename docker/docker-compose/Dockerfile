FROM node:20-alpine

LABEL maintainer="support@forus.io"
LABEL description="Forus platform frontend image for development"

RUN apk update \
    && apk --no-cache --virtual build-dependencies add \
    python3 \
    make \
    g++ \
    iputils \
    net-tools \
    mc \
    wget

CMD tail -f /dev/null