package api

import (
	"context"
	"fmt"
	"log"
	"net"
	"sync"

	pb "github.com/nickysemenza/gomeme/api/proto"
	"google.golang.org/grpc"
)

//Server conforms to interface for proto generated stubs
type Server struct{}

//GetPing responds to a ping message
func (s *Server) GetPing(ctx context.Context, in *pb.Ping) (*pb.Ping, error) {
	return &pb.Ping{Message: fmt.Sprintf("pong: %s", in.Message)}, nil
}

//NewServer makes a server
func NewServer() *grpc.Server {
	grpcServer := grpc.NewServer()
	pb.RegisterAPIServer(grpcServer, &Server{})
	return grpcServer
}

//ServegRPC runs an gRPC server
func ServegRPC(ctx context.Context, wg *sync.WaitGroup) {
	lis, err := net.Listen("tcp", ":9090")
	// lis, err := net.Listen("tcp", fmt.Sprintf(":%d", port))
	if err != nil {
		log.Fatalf("failed to listen: %v", err)
	}
	grpcServer := NewServer()
	go grpcServer.Serve(lis)

	<-ctx.Done()
	log.Printf("[grpc] shutdown")
	grpcServer.GracefulStop()
	wg.Done()

}
