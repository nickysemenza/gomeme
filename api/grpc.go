package api

import (
	"context"
	"fmt"
	"os/exec"
	"sort"
	"strings"

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
func pointToPB(p generator.Point) *pb.Point {
	return &pb.Point{X: p.X, Y: p.Y}
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
			t.Targets = append(t.Targets, &pb.Target{
				Size:         pointToPB(target.Size),
				FriendlyName: target.FriendlyName,
				TopLeft:      pointToPB(target.TopLeft)})
		}
		templates = append(templates, &t)
	}
	sort.Slice(templates, func(i, j int) bool {
		return templates[i].Name < templates[j].Name
	})
	return &pb.TemplateList{Templates: templates}, nil
}

func (s *Server) GetInfo(ctx context.Context, _ *pb.InfoParams) (*pb.SystemInfo, error) {
	si := pb.SystemInfo{
		Commands: map[string]string{},
	}
	cmds := []*exec.Cmd{
		generator.RunCommand(ctx, "magick", "-version"),
		generator.RunCommand(ctx, "magick", "-list", "font"),
	}
	for _, cmd := range cmds {
		output, err := cmd.CombinedOutput()
		if err != nil {
			return nil, err
		}
		si.Commands[strings.Join(cmd.Args, " ")] = string(output)
	}
	return &si, nil
}

// CreateMeme makes a meme
func (s *Server) CreateMeme(ctx context.Context, in *pb.CreateMemeParams) (*pb.Meme, error) {
	meme, err := s.g.Process(ctx, in)
	if err != nil {
		err = fmt.Errorf("failed to generate meme: %w", err)
		spew.Dump(meme.OpLog)
		fmt.Println(err)
		return nil, err
	}
	spew.Dump(meme)
	return &pb.Meme{
		ID:     meme.ID,
		URL:    s.g.GetMemeURL(meme),
		OpLog:  meme.OpLog,
		Params: in,
	}, nil
}

//NewServer makes a server
func NewServer(g *generator.Generator) *grpc.Server {
	grpcServer := grpc.NewServer()
	pb.RegisterAPIServer(grpcServer, &Server{g: g})
	return grpcServer
}
