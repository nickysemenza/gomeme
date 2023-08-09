FROM node as ui-builder
WORKDIR /work/ui
COPY ui/package.json ui/yarn.lock ./
RUN yarn
COPY ui ./
RUN yarn build

FROM golang:1.21 as go-builder
COPY . /src/gomeme
WORKDIR /src/gomeme
RUN make build

FROM ghcr.io/nickysemenza/docker-magick:main
ENV DEBIAN_FRONTEND=noninteractive

COPY --from=go-builder src/gomeme/gomeme /
COPY --from=ui-builder /work/ui/build /ui/build
COPY gomeme.yaml .
ADD templates templates
CMD "./gomeme"
