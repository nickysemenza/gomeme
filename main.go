package main

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/davecgh/go-spew/spew"
	"github.com/go-chi/chi"
	"github.com/go-chi/chi/middleware"
)

var gg *Generator

func main() {
	config, err := LoadConfig()
	spew.Dump(config, err)

	g := Generator{config}
	gg = &g
	// input1 := Input{
	// 	TemplateName: "office1",
	// 	TargetInputs: []TargetInput{TargetInput{"in1.png"}, TargetInput{"in1.png"}},
	// }

	// meme, err := g.Process(input1)
	// spew.Dump(meme, err)
	r := buildRouter()
	http.ListenAndServe(":3333", r)

}
func newMeme(w http.ResponseWriter, r *http.Request) {
	input1 := Input{
		TemplateName: "office1",
		TargetInputs: []TargetInput{TargetInput{"in1.png"}, TargetInput{"in1.png"}},
	}

	meme, err := gg.Process(input1)
	spew.Dump(meme, err)

	js, err := json.Marshal(meme)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(js)

}

func buildRouter() *chi.Mux {
	r := chi.NewRouter()

	// A good base middleware stack
	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.Timeout(60 * time.Second))
	r.Get("/", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("hi"))
	})
	r.Get("/meme", newMeme)
	return r

}
