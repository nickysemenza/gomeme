package main

import (
	"context"
	"encoding/json"
	"html/template"
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/nickysemenza/gomeme/api"

	"github.com/davecgh/go-spew/spew"
	"github.com/go-chi/chi"
	"github.com/go-chi/chi/middleware"
	"github.com/go-chi/cors"
	"github.com/improbable-eng/grpc-web/go/grpcweb"
)

var gg *Generator

//Server is a HTTP server
type Server struct {
	G *grpcweb.WrappedGrpcServer
}

func main() {

	ctx := context.Background()
	config, err := LoadConfig()
	spew.Dump(err)
	spew.Dump(config, err)

	wg := sync.WaitGroup{}

	go api.ServegRPC(ctx, &wg)

	g := Generator{config}
	gg = &g

	grpcServer := api.NewServer()
	wrappedGrpc := grpcweb.WrapServer(grpcServer)

	s := Server{wrappedGrpc}
	r := s.buildRouter()

	http.ListenAndServe(":3333", r)

}

//GrpcWebMiddleware handles wrapped GPRC requests
type GrpcWebMiddleware struct {
	*grpcweb.WrappedGrpcServer
}

//Handler handles wrapped GPRC requests
func (m *GrpcWebMiddleware) Handler(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if m.IsAcceptableGrpcCorsRequest(r) || m.IsGrpcWebRequest(r) {
			m.ServeHTTP(w, r)
			return
		}
		next.ServeHTTP(w, r)
	})
}

//NewGrpcWebMiddleware handles wrapped GPRC requests
func NewGrpcWebMiddleware(grpcWeb *grpcweb.WrappedGrpcServer) *GrpcWebMiddleware {
	return &GrpcWebMiddleware{grpcWeb}
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
	meme, err := gg.Process(ctx, input1)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

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

func (s *Server) buildRouter() *chi.Mux {
	r := chi.NewRouter()

	cors := cors.New(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"*"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300, // Maximum value not ignored by any of major browsers
		// Debug:            true,
	})
	r.Use(cors.Handler)

	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.Timeout(60 * time.Second))

	r.Use(NewGrpcWebMiddleware(s.G).Handler)

	r.Get("/", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("hi"))
	})

	r.Handle("/tmp/{res}", http.StripPrefix("/tmp/", http.FileServer(http.Dir("tmp/"))))

	r.Post("/meme", newMeme)

	return r

}
