package api

import (
	"context"
	"fmt"
	"log"
	"net"
	"sync"

	pb "github.com/nickysemenza/gomeme/api/proto"
	"github.com/nickysemenza/gomeme/generator"
	"google.golang.org/grpc"
)

//Server conforms to interface for proto generated stubs
type Server struct {
	g *generator.Generator
}

//GetPing responds to a ping message
func (s *Server) GetPing(ctx context.Context, in *pb.Ping) (*pb.Ping, error) {
	return &pb.Ping{Message: fmt.Sprintf("pong: %s", in.Message)}, nil
}

//GetTemplates returns a list of all templates
func (s *Server) GetTemplates(ctx context.Context, _ *pb.GetTemplatesParams) (*pb.TemplateList, error) {
	var templates []*pb.Template
	for name, template := range s.g.Config.Templates {
		templates = append(templates, &pb.Template{
			URL:  template.File,
			Name: name,
		})
	}
	return &pb.TemplateList{Templates: templates}, nil
}

//NewServer makes a server
func NewServer(g *generator.Generator) *grpc.Server {
	grpcServer := grpc.NewServer()
	pb.RegisterAPIServer(grpcServer, &Server{g: g})
	return grpcServer
}

//ServegRPC runs an gRPC server
func ServegRPC(ctx context.Context, wg *sync.WaitGroup, grpcServer *grpc.Server) {
	lis, err := net.Listen("tcp", ":9090")
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
