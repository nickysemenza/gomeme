package main

import "github.com/davecgh/go-spew/spew"

func main() {
	config, err := LoadConfig()
	spew.Dump(config, err)
}
