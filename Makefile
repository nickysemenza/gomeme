OUT_DIR = "./ui/src/"
PROTOC_GEN_TS_PATH ="./ui/node_modules/.bin/protoc-gen-ts"
SED = "gsed" # GNU sed on macOS

# https://grpc.io/docs/languages/go/quickstart/#regenerate-grpc-code
protogen:
	protoc \
		--plugin="protoc-gen-ts=$(PROTOC_GEN_TS_PATH)" \
		--js_out="import_style=commonjs,binary:$(OUT_DIR)" \
		--ts_out="service=grpc-web:$(OUT_DIR)" \
		--go_out=. --go_opt=paths=source_relative \
		--go-grpc_out=. --go-grpc_opt=paths=source_relative \
		proto/*.proto
	
	$(SED) -i '10i //@ts-ignore' ui/src/proto/meme_pb.js
	$(SED) -i '1i /* eslint-disable */' ui/src/proto/meme_pb.js

GOBUILD= CGO_ENABLED=0 go build -o gomeme

build:
	$(GOBUILD)
dev: build
	./gomeme
dev-ui:
	cd ui && yarn run start
test:
	go test -race -cover ./...

bin/golangci-lint:
	@mkdir -p $(dir $@)
	go build -o $@ ./vendor/github.com/golangci/golangci-lint/cmd/golangci-lint
bin/go-acc:
	@mkdir -p $(dir $@)
	go build -o $@ ./vendor/github.com/ory/go-acc	
lint-go: bin/golangci-lint
	bin/golangci-lint run || (echo "lint failed"; exit 1)
unit-cover-go: bin/go-acc
	./bin/go-acc -o coverage-full.txt ./... -- -race	