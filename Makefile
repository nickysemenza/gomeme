OUT_DIR = "./ui/src/"
PROTOC_GEN_TS_PATH ="./ui/node_modules/.bin/protoc-gen-ts"

# https://grpc.io/docs/languages/go/quickstart/#regenerate-grpc-code
protogen:
	protoc \
		--plugin="protoc-gen-ts=$(PROTOC_GEN_TS_PATH)" \
		--plugin="protoc-gen-js=./ui/node_modules/.bin/protoc-gen-js" \
		--js_out="import_style=commonjs,binary:$(OUT_DIR)" \
		--ts_out="service=grpc-web:$(OUT_DIR)" \
		--go_out=. --go_opt=paths=source_relative \
		--go-grpc_out=. --go-grpc_opt=paths=source_relative \
		proto/*.proto
	

GOBUILD= CGO_ENABLED=0 go build -o gomeme

build:
	$(GOBUILD)
dev: build
	./gomeme
dev-ui:
	cd ui && yarn run start
test:
	go test -race -cover ./...

lint-go:
	golangci-lint run || (echo "lint failed"; exit 1)
unit-cover-go:
	go test -race -coverpkg=./... -coverprofile=coverage-full.txt ./...	