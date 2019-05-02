OUT_DIR = "./ui"
PROTOC_GEN_TS_PATH ="./ui/node_modules/.bin/protoc-gen-ts"

run: 
	go run .
protogen:
	protoc \
		--plugin="protoc-gen-ts=$(PROTOC_GEN_TS_PATH)" \
		--js_out="import_style=commonjs,binary:$(OUT_DIR)" \
		--ts_out="service=true:$(OUT_DIR)" \
		--go_out=plugins=grpc:api \
		proto/*.proto