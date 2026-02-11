FROM node AS ui-builder
WORKDIR /work/ui
COPY ui/package.json ui/package-lock.json ui/.npmrc ./
RUN npm ci
COPY ui ./
RUN npm run build

FROM golang:1.26 AS go-builder
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
