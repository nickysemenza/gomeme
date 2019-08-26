OUT_DIR = "./ui/src/"
PROTOC_GEN_TS_PATH ="./ui/node_modules/.bin/protoc-gen-ts"
SED = "gsed" # GNU sed on macOS

protogen:
	protoc \
		--plugin="protoc-gen-ts=$(PROTOC_GEN_TS_PATH)" \
		--js_out="import_style=commonjs,binary:$(OUT_DIR)" \
		--ts_out="service=true:$(OUT_DIR)" \
		--go_out=plugins=grpc:api \
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