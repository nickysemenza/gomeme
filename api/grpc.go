package api

import (
	"context"
	"fmt"

	"github.com/davecgh/go-spew/spew"
	"github.com/nickysemenza/gomeme/generator"
	pb "github.com/nickysemenza/gomeme/proto"
	"google.golang.org/grpc"
)

//Server conforms to interface for proto generated stubs
type Server struct {
	g *generator.Generator
	pb.UnimplementedAPIServer
}

//GetPing responds to a ping message
func (s *Server) GetPing(ctx context.Context, in *pb.Ping) (*pb.Ping, error) {
	return &pb.Ping{Message: fmt.Sprintf("pong: %s", in.Message)}, nil
}

//GetTemplates returns a list of all templates
func (s *Server) GetTemplates(ctx context.Context, _ *pb.GetTemplatesParams) (*pb.TemplateList, error) {
	var templates []*pb.Template
	for name, template := range s.g.Config.Templates {
		t := pb.Template{
			URL:  template.File,
			Name: name,
		}
		for _, target := range template.Targets {
			t.Targets = append(t.Targets, &pb.Target{TopLeft: &pb.Point{X: int32(target.TopLeft.X)}})
		}
		templates = append(templates, &t)
	}
	return &pb.TemplateList{Templates: templates}, nil
}

//CreateMeme makes a meme
func (s *Server) CreateMeme(ctx context.Context, in *pb.CreateMemeParams) (*pb.Meme, error) {
	// input := generator.Input{TemplateName: in.GetTemplateName()}
	// for _, i := range in.GetTargetInputs() {
	// 	input.TargetInputs = append(input.TargetInputs, generator.TargetInput{
	// 		FileName: i.GetFileName(),
	// 		URL:      i.GetURL()})
	// }
	meme, err := s.g.Process(ctx, in)
	if err != nil {
		err = fmt.Errorf("failed to generate meme: %w", err)
		fmt.Println(err)
		return nil, err
	}
	spew.Dump(meme)
	return &pb.Meme{
		UUID: meme.UUID,
		URL:  fmt.Sprintf("http://%s:%d/%s", s.g.Config.Listen.Host, s.g.Config.Listen.HTTPPort, meme.ResultFile),
	}, nil
}

//NewServer makes a server
func NewServer(g *generator.Generator) *grpc.Server {
	grpcServer := grpc.NewServer()
	pb.RegisterAPIServer(grpcServer, &Server{g: g})
	return grpcServer
}
