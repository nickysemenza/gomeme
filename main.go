package main

import "github.com/davecgh/go-spew/spew"

func main() {
	config, err := LoadConfig()
	spew.Dump(config, err)

	g := Generator{config}

	input1 := Input{
		TemplateName: "office1",
		TargetInputs: []TargetInput{TargetInput{"in1.png"}, TargetInput{"in1.png"}},
	}

	meme, err := g.Process(input1)
	spew.Dump(meme, err)

}
