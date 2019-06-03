FROM node:8@sha256:acd0d53169592d955c1a668ba9685bf9cb6a1daf5adba000ad28f35108bf5fde as ui-builder
COPY ui /ui
WORKDIR /ui
RUN yarn
RUN yarn build

FROM golang:1.12.0@sha256:99ea21f08666ff99def73294c2f85a3869b5fcacc2535ba51e315766a25b9626 as go-builder
COPY . /src/gomeme
WORKDIR /src/gomeme
RUN make build

FROM debian:stretch@sha256:75f7d0590b45561bfa443abad0b3e0f86e2811b1fc176f786cd30eb078d1846f
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y imagemagick

COPY --from=go-builder src/gomeme/gomeme /
COPY --from=ui-builder /ui/build /ui