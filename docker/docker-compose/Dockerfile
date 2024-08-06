FROM node:19-alpine

LABEL maintainer="support@forus.io"
LABEL description="Forus platform (frontend), used for docker compose"

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