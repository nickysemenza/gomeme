FROM node:buster-slim as ui-builder
COPY ui /ui
WORKDIR /ui
RUN yarn
RUN yarn build

FROM golang:1.16-buster as go-builder
COPY . /src/gomeme
WORKDIR /src/gomeme
RUN make build

FROM debian:buster
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y imagemagick

COPY --from=go-builder src/gomeme/gomeme /
COPY --from=ui-builder /ui/build /ui