FROM node:buster-slim as ui-builder
WORKDIR /work/ui
COPY ui/package.json ui/yarn.lock ./
RUN yarn
COPY ui ./
RUN yarn build

FROM golang:1.17 as go-builder
COPY . /src/gomeme
WORKDIR /src/gomeme
RUN make build

FROM debian:bullseye
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y ca-certificates wget libfuse2 libfreetype6 libglib2.0-0 libfontconfig libx11-6 imagemagick
RUN update-ca-certificates


RUN wget https://imagemagick.org/download/binaries/magick && \
	chmod +x magick && \
	mv magick /usr/local/bin/magick

COPY --from=go-builder src/gomeme/gomeme /
# COPY --from=ui-builder /work/ui/build /ui/build
COPY gomeme.yaml .
ADD templates templates
CMD "./gomeme"