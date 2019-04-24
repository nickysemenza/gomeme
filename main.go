package main

import (
	"encoding/json"
	"html/template"
	"log"
	"net/http"
	"time"

	"github.com/davecgh/go-spew/spew"
	"github.com/go-chi/chi"
	"github.com/go-chi/chi/middleware"
)

var gg *Generator

func main() {
	config, err := LoadConfig()
	spew.Dump(err)
	// spew.Dump(config, err)

	g := Generator{config}
	gg = &g

	r := buildRouter()
	http.ListenAndServe(":3333", r)

}
func newMeme(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	decoder := json.NewDecoder(r.Body)
	var input1 Input
	err := decoder.Decode(&input1)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// input1 := Input{
	// 	TemplateName: "office1",
	// 	TargetInputs: []TargetInput{TargetInput{FileName: "in1.png"}, TargetInput{FileName: "in1.png"}},
	// }

	meme, err := gg.Process(ctx, input1)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	// spew.Dump(meme, err)

	// js, err := json.Marshal(meme)
	// if err != nil {
	// 	http.Error(w, err.Error(), http.StatusInternalServerError)
	// 	return
	// }

	// w.Header().Set("Content-Type", "application/json")
	// w.Write(js)

	var ImageTemplate = `<!DOCTYPE html>
    <html lang="en"><head></head>
	<body><img style="width: 400px" src="{{.Image}}"></body>`

	if tmpl, err := template.New("image").Parse(ImageTemplate); err != nil {
		log.Println("unable to parse image template.")
	} else {
		data := map[string]interface{}{"Image": meme.ResultFile}
		if err = tmpl.Execute(w, data); err != nil {
			log.Println("unable to execute template.")
		}
	}

}

func buildRouter() *chi.Mux {
	r := chi.NewRouter()

	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.Timeout(60 * time.Second))
	r.Get("/", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("hi"))
	})

	// fs := http.FileServer(http.Dir("/Users/nickysemenza/dev/gomeme/tmp"))

	r.Handle("/tmp/{res}", http.StripPrefix("/tmp/", http.FileServer(http.Dir("tmp/"))))

	r.Post("/meme", newMeme)

	return r

}
