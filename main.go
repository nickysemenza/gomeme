package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/nickysemenza/gomeme/api"
	"github.com/nickysemenza/gomeme/generator"
	"github.com/spf13/viper"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
)

// Server is a HTTP server
type Server struct {
	generator *generator.Generator
}

func main() {
	viper.SetDefault("LISTEN_HOST", "localhost")
	viper.SetDefault("BASE_API", "http://localhost:3333")
	viper.SetDefault("FONT", "helvetica")

	viper.AutomaticEnv()

	listenAddr := fmt.Sprintf("%s:3333", viper.GetString("LISTEN_HOST"))

	config, err := generator.LoadConfig()
	if err != nil {
		log.Fatal(err)
	}
	config.Listen = generator.Listen{Host: viper.GetString("LISTEN_HOST"), HTTPPort: 3333}
	config.Font = viper.GetString("FONT")
	config.BaseAPI = viper.GetString("BASE_API")

	g := generator.Generator{Config: config}
	s := Server{generator: &g}

	r := s.buildRouter()

	fmt.Printf("starting http server on %s\n", listenAddr)
	log.Fatal(http.ListenAndServe(listenAddr, r))
}

func (s *Server) buildRouter() *chi.Mux {
	r := chi.NewRouter()

	// CORS config
	corsHandler := cors.New(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"*"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300,
	})
	r.Use(corsHandler.Handler)

	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.Timeout(60 * time.Second))

	// Mount Connect handler
	path, handler := api.NewServer(s.generator)
	r.Mount(path, handler)

	// REST endpoints
	r.Get("/hi", func(w http.ResponseWriter, r *http.Request) {
		_, _ = w.Write([]byte("hi"))
	})
	r.Get("/b/{payload}", func(w http.ResponseWriter, r *http.Request) {
		b := chi.URLParam(r, "payload")
		ctx := r.Context()
		meme, err := s.generator.ProcessBase64Payload(ctx, b)
		if err != nil {
			w.WriteHeader(http.StatusBadRequest)
			_, _ = w.Write([]byte(err.Error()))
			return
		}
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(meme)
	})

	// Static file serving
	r.Handle("/tmp/{res}", http.StripPrefix("/tmp/", http.FileServer(http.Dir("tmp/"))))
	r.Handle("/templates/{res}", http.StripPrefix("/templates/", http.FileServer(http.Dir("templates/"))))

	FileServer(r)

	return r
}

// FileServer serves static files from ui/build
func FileServer(router *chi.Mux) {
	root := "ui/build"
	fs := http.FileServer(http.Dir(root))

	router.Get("/*", func(w http.ResponseWriter, r *http.Request) {
		if _, err := os.Stat(root + r.RequestURI); os.IsNotExist(err) {
			http.StripPrefix(r.RequestURI, fs).ServeHTTP(w, r)
		} else {
			fs.ServeHTTP(w, r)
		}
	})
}
