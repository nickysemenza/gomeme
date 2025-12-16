protogen:
	buf generate

GOBUILD= CGO_ENABLED=0 go build -o gomeme

build:
	$(GOBUILD)
dev: build
	./gomeme
dev-ui:
	cd ui && npm start
test:
	go test -race -cover ./...

lint-go:
	golangci-lint run || (echo "lint failed"; exit 1)
unit-cover-go:
	go test -race -coverpkg=./... -coverprofile=coverage-full.txt ./...	