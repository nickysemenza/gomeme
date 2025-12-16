package api

import (
	"context"
	"fmt"
	"net/http"
	"os/exec"
	"sort"
	"strings"

	"connectrpc.com/connect"
	"github.com/davecgh/go-spew/spew"
	pb "github.com/nickysemenza/gomeme/gen"
	"github.com/nickysemenza/gomeme/gen/memepbconnect"
	"github.com/nickysemenza/gomeme/generator"
)

// Server implements the MemeService Connect handler
type Server struct {
	g *generator.Generator
}

// NewServer creates a new Connect service handler
func NewServer(g *generator.Generator) (string, http.Handler) {
	return memepbconnect.NewMemeServiceHandler(&Server{g: g})
}

// GetPing responds to a ping message
func (s *Server) GetPing(ctx context.Context, req *connect.Request[pb.Ping]) (*connect.Response[pb.Ping], error) {
	return connect.NewResponse(&pb.Ping{Message: fmt.Sprintf("pong: %s", req.Msg.Message)}), nil
}

func pointToPB(p generator.Point) *pb.Point {
	return &pb.Point{X: p.X, Y: p.Y}
}

// GetTemplates returns a list of all templates
func (s *Server) GetTemplates(ctx context.Context, req *connect.Request[pb.GetTemplatesParams]) (*connect.Response[pb.TemplateList], error) {
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
				TopLeft:      pointToPB(target.TopLeft),
			})
		}
		templates = append(templates, &t)
	}
	sort.Slice(templates, func(i, j int) bool {
		return templates[i].Name < templates[j].Name
	})
	return connect.NewResponse(&pb.TemplateList{Templates: templates}), nil
}

// GetInfo returns system information
func (s *Server) GetInfo(ctx context.Context, req *connect.Request[pb.InfoParams]) (*connect.Response[pb.SystemInfo], error) {
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
			return nil, connect.NewError(connect.CodeInternal, err)
		}
		si.Commands[strings.Join(cmd.Args, " ")] = string(output)
	}
	return connect.NewResponse(&si), nil
}

// CreateMeme makes a meme
func (s *Server) CreateMeme(ctx context.Context, req *connect.Request[pb.CreateMemeParams]) (*connect.Response[pb.Meme], error) {
	meme, err := s.g.Process(ctx, req.Msg)
	if err != nil {
		err = fmt.Errorf("failed to generate meme: %w", err)
		spew.Dump(meme.OpLog)
		fmt.Println(err)
		return nil, connect.NewError(connect.CodeInternal, err)
	}
	spew.Dump(meme)
	return connect.NewResponse(&pb.Meme{
		ID:     meme.ID,
		URL:    s.g.GetMemeURL(meme),
		OpLog:  meme.OpLog,
		Params: req.Msg,
	}), nil
}
