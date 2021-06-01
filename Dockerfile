FROM node:buster-slim as ui-builder
WORKDIR /work/ui
COPY ui/package.json ui/yarn.lock ./
RUN yarn
COPY ui ./
RUN yarn build

FROM golang:1.16-buster as go-builder
COPY . /src/gomeme
WORKDIR /src/gomeme
RUN make build

FROM debian:buster-slim
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y imagemagick ca-certificates
RUN update-ca-certificates


COPY --from=go-builder src/gomeme/gomeme /
COPY --from=ui-builder /work/ui/build /ui/build
COPY gomeme.json .
ADD templates templates
CMD "./gomeme"