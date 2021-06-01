package main

import (
	"context"
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

var gg *generator.Generator

//Server is a HTTP server
type Server struct {
	G      *grpcweb.WrappedGrpcServer
	Listen generator.Listen
}

func main() {

	viper.SetDefault("LISTEN_HOST", "localhost")
	viper.AutomaticEnv()

	l := generator.Listen{Host: viper.GetString("LISTEN_HOST"), HTTPPort: 3333, GRPCPort: 9090}
	s := Server{Listen: l}

	ctx := context.Background()
	config, err := generator.LoadConfig()
	if err != nil {
		log.Fatal(err)
	}
	config.Listen = l

	wg := sync.WaitGroup{}

	g := generator.Generator{Config: config}
	gg = &g

	grpcServer := api.NewServer(&g)

	s.G = grpcweb.WrapServer(grpcServer)

	go s.servegRPC(ctx, &wg, grpcServer)

	r := s.buildRouter()

	fmt.Printf("starting http: %v", l)
	http.ListenAndServe(fmt.Sprintf("%s:%d", l.Host, l.HTTPPort), r)

}

//ServegRPC runs an gRPC server
func (s *Server) servegRPC(ctx context.Context, wg *sync.WaitGroup, grpcServer *grpc.Server) {
	lis, err := net.Listen("tcp", fmt.Sprintf("%s:%d", s.Listen.Host, s.Listen.GRPCPort))
	// lis, err := net.Listen("tcp", fmt.Sprintf(":%d", port))
	if err != nil {
		log.Fatalf("failed to listen: %v", err)
	}
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

// func newMeme(w http.ResponseWriter, r *http.Request) {
// 	ctx := r.Context()
// 	decoder := json.NewDecoder(r.Body)

// 	var input1 pb.Input
// 	err := decoder.Decode(&input1)
// 	if err != nil {
// 		http.Error(w, err.Error(), http.StatusInternalServerError)
// 		return
// 	}
// 	meme, err := gg.Process(ctx, input1)
// 	if err != nil {
// 		http.Error(w, err.Error(), http.StatusInternalServerError)
// 		return
// 	}

// 	var ImageTemplate = `<!DOCTYPE html>
//     <html lang="en"><head></head>
// 	<body><img style="width: 400px" src="{{.Image}}"></body>`

// 	if tmpl, err := template.New("image").Parse(ImageTemplate); err != nil {
// 		log.Println("unable to parse image template.")
// 	} else {
// 		data := map[string]interface{}{"Image": meme.ResultFile}
// 		if err = tmpl.Execute(w, data); err != nil {
// 			log.Println("unable to execute template.")
// 		}
// 	}

// }

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

	r.Get("/hi", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("hi"))
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
