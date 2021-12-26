package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net"
	"net/http"
	"os"
	"sync"
	"time"

	"github.com/nickysemenza/gomeme/api"
	"github.com/nickysemenza/gomeme/generator"
	"github.com/spf13/viper"
	"google.golang.org/grpc"

	"github.com/go-chi/chi"
	"github.com/go-chi/chi/middleware"
	"github.com/go-chi/cors"
	"github.com/improbable-eng/grpc-web/go/grpcweb"
)

//Server is a HTTP server
type Server struct {
	grpc      *grpcweb.WrappedGrpcServer
	generator *generator.Generator
	Listen    generator.Listen
}

func main() {

	viper.SetDefault("LISTEN_HOST", "localhost")
	viper.SetDefault("BASE_API", "http://localhost:3333")
	viper.AutomaticEnv()

	l := generator.Listen{Host: viper.GetString("LISTEN_HOST"), HTTPPort: 3333, GRPCPort: 9091}
	s := Server{Listen: l}

	ctx := context.Background()
	config, err := generator.LoadConfig()
	if err != nil {
		log.Fatal(err)
	}
	config.Listen = l

	wg := sync.WaitGroup{}

	g := generator.Generator{Config: config}
	s.generator = &g

	grpcServer := api.NewServer(&g)

	s.grpc = grpcweb.WrapServer(grpcServer)

	go s.servegRPC(ctx, &wg, grpcServer)

	r := s.buildRouter()

	fmt.Printf("starting http: %v", l)
	log.Fatal(http.ListenAndServe(fmt.Sprintf("%s:%d", l.Host, l.HTTPPort), r))

}

//ServegRPC runs an gRPC server
func (s *Server) servegRPC(ctx context.Context, wg *sync.WaitGroup, grpcServer *grpc.Server) {
	lis, err := net.Listen("tcp", fmt.Sprintf("%s:%d", s.Listen.Host, s.Listen.GRPCPort))
	// lis, err := net.Listen("tcp", fmt.Sprintf(":%d", port))
	if err != nil {
		log.Fatalf("failed to listen: %v", err)
	}
	//nolint:errcheck
	go grpcServer.Serve(lis)

	<-ctx.Done()
	log.Printf("[grpc] shutdown")
	grpcServer.GracefulStop()
	wg.Done()

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

	r.Use(NewGrpcWebMiddleware(s.grpc).Handler)

	r.Get("/hi", func(w http.ResponseWriter, r *http.Request) {
		//nolint: errcheck
		w.Write([]byte("hi"))
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
		if true {
			w.Header().Set("Content-Type", "application/json")
			_ = json.NewEncoder(w).Encode(meme)
		} else {
			_, _ = w.Write([]byte(s.generator.GetMemeURL(meme)))
		}
	})

	r.Handle("/tmp/{res}", http.StripPrefix("/tmp/", http.FileServer(http.Dir("tmp/"))))
	r.Handle("/templates/{res}", http.StripPrefix("/templates/", http.FileServer(http.Dir("templates/"))))
	// r.PathPre("/", http.FileServer(http.Dir("ui/build")))

	FileServer(r)

	// r.Post("/meme", newMeme)

	return r

}

// FileServer is serving static files.
// https://github.com/go-chi/chi/issues/403
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
