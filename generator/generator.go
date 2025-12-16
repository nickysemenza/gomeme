package generator

import (
	"context"
	"encoding/base64"
	"fmt"
	"math/rand"
	"os/exec"
	"path/filepath"
	"strings"
	"time"

	pb "github.com/nickysemenza/gomeme/gen"
	"github.com/nickysemenza/gomeme/util"
	"github.com/oklog/ulid/v2"
	"google.golang.org/protobuf/encoding/protojson"

	log "github.com/sirupsen/logrus"
)

// Generator is the singleton application
type Generator struct {
	Config *Config
}

// Meme is a meme
type Meme struct {
	ID          string      `json:"id,omitempty"`
	CurrentStep int32       `json:"current_step,omitempty"`
	OpLog       []*pb.OpLog `json:"op_log,omitempty"`
	ResultFile  string      `json:"file,omitempty"`
	g           *Generator
	hash        string
}

// ImageURL returns raw image url
func (c *Config) ImageURL(image string) string {
	return fmt.Sprintf("%s/%s", c.BaseAPI, filepath.Join("tmp", filepath.Base(image)))
}

// GetMemeURL returns the full url
func (g *Generator) GetMemeURL(meme *Meme) string {
	return g.Config.ImageURL(meme.ResultFile)
}

// ProcessBase64Payload processes a base64 payload
func (g *Generator) ProcessBase64Payload(ctx context.Context, b string) (*Meme, error) {
	jsonBytes, err := base64.StdEncoding.DecodeString(b)
	if err != nil {
		return nil, err
	}
	var req pb.CreateMemeParams
	err = protojson.Unmarshal(jsonBytes, &req)
	if err != nil {
		return nil, err
	}
	return g.Process(ctx, &req)

}

// Process makes a meme
func (g *Generator) Process(ctx context.Context, req *pb.CreateMemeParams) (*Meme, error) {
	templateName := req.TemplateName
	template, ok := g.Config.Templates[templateName]
	if !ok {
		return nil, fmt.Errorf("Process: template %s does not exist", templateName)
	}

	jsonBytes, err := protojson.Marshal(req)
	if err != nil {
		return nil, fmt.Errorf("Process: %w", err)
	}
	hash := base64.StdEncoding.EncodeToString(jsonBytes)
	log.Info("Process: hash: ", hash)

	//TODO: ensure length of input is right

	t := time.Now()
	m := Meme{
		ID:         ulid.MustNew(ulid.Timestamp(t), ulid.Monotonic(rand.New(rand.NewSource(t.UnixNano())), 0)).String(),
		ResultFile: filepath.Join(g.Config.BaseDir, template.File),
		g:          g,
		hash:       hash,
	}

	for step, target := range template.Targets {
		m.CurrentStep = int32(step)
		input := req.TargetInputs[step]

		var fileName string

		if text := input.GetTextInput(); text != nil {
			fileName, err = m.makeText(ctx, text.Text, text.Color, target.Size)
			if err != nil {
				return &m, fmt.Errorf("Process: failed to make text: %w", err)
			}
		} else if img := input.GetImageInput(); img != nil {
			fileName, err = m.GetFile(ctx, img)
			if err != nil {
				return &m, fmt.Errorf("Process: failed to get file: %w", err)
			}

			// text should already by target.Size so only need to do for images
			fileName, err = m.shrinkToSize(ctx, fileName, target.Size, img.Stretch)
			if err != nil {
				return &m, fmt.Errorf("Process: failed to shrink: %w", err)
			}
		}

		dist := target.Size.BuildBase()
		err = dist.applyDelta(target.Deltas)
		if err != nil {
			return &m, fmt.Errorf("Process: failed to apply delta: %w", err)
		}
		distortedFile, err := m.distort(ctx, fileName, dist)
		if err != nil {
			return &m, fmt.Errorf("Process: failed to distort: %w", err)
		}
		compositedFile, err := m.composite(ctx, distortedFile, m.ResultFile, target.TopLeft)
		if err != nil {
			return &m, fmt.Errorf("Process: failed to composite: %w", err)
		}

		if req.GetDebug() {
			//debug overlay
			bounding, err := m.makeRectangle(ctx, target.TopLeft, target.TopLeft.Add(target.Size), template.Size, nil)
			if err != nil {
				return &m, fmt.Errorf("Process: failed to add bounding: %w", err)
			}
			compositedFile, err = m.composite(ctx, bounding, compositedFile, Point{})
			if err != nil {
				return &m, fmt.Errorf("Process: failed to composite: %w", err)
			}

			if target.Deltas != nil {
				bounding, err = m.makeRectangle(ctx, target.TopLeft, target.TopLeft.Add(target.Size), template.Size, target.Deltas)
				if err != nil {
					return &m, fmt.Errorf("Process: failed to add bounding: %w", err)
				}
				compositedFile, err = m.composite(ctx, bounding, compositedFile, Point{})
				if err != nil {
					return &m, fmt.Errorf("Process: failed to composite: %w", err)
				}
			}
		}

		m.ResultFile = filepath.Join(m.g.Config.TmpDir(), fmt.Sprintf("%s-final.png", m.ID))
		fmt.Println(compositedFile)
		if err = m.cpFile(ctx, compositedFile, m.ResultFile); err != nil {
			return &m, fmt.Errorf("Process: failed to copy: %w", err)
		}

	}
	m.ResultFile = filepath.Base(m.ResultFile) // trim to just be the file

	return &m, nil
}
func (m *Meme) genFile(op pb.Operation) string {
	return filepath.Join(m.g.Config.TmpDir(), fmt.Sprintf("%s-%d-%s.png", m.ID, m.CurrentStep, op))
}

func (m *Meme) shrinkToSize(ctx context.Context, fileName string, destSize Point, stretch bool) (string, error) {
	op := pb.Operation_Shrink
	dest := m.genFile(op)
	t := time.Now()
	flags := ""
	if stretch { //todo: opt in to stretch
		// https://legacy.imagemagick.org/Usage/resize/#noaspect
		flags = "!"
	}
	// https://legacy.imagemagick.org/Usage/thumbnails/#pad
	args := []string{
		fileName,
		"-resize", fmt.Sprintf("%s%s", destSize.Dim(), flags),
		"-background", "none", // order matters here
		"-gravity", "center",
		"-extent", destSize.Dim(),
		dest,
	}
	cmd := RunCommand(ctx, "magick", args...)
	output, err := cmd.CombinedOutput()
	m.OpLog = append(m.OpLog, &pb.OpLog{Step: m.CurrentStep,
		Op:          op,
		Duration:    time.Since(t).String(),
		DebugOutput: string(output),
		File:        m.g.Config.ImageURL(dest),
		Args:        args,
	})
	return dest, err
}

func (m *Meme) distort(ctx context.Context, fileName string, payload DistortPayload) (string, error) {
	if !payload.set() ||
		(payload.ControlPoints[0].P1.X == 0 &&
			payload.ControlPoints[0].P1.Y == 0 &&
			payload.ControlPoints[0].P2.X == 0 &&
			payload.ControlPoints[0].P2.Y == 0) {
		return fileName, nil
	}
	op := pb.Operation_Distort
	dest := m.genFile(op)
	t := time.Now()
	args := []string{
		fileName,
		"-matte",
		"-virtual-pixel", "transparent",
		"-distort", "Perspective",
		payload.ToIMString(),
		dest,
	}
	cmd := RunCommand(ctx, "magick", args...)
	output, err := cmd.CombinedOutput()
	m.OpLog = append(m.OpLog, &pb.OpLog{Step: m.CurrentStep,
		Op:          op,
		Duration:    time.Since(t).String(),
		DebugOutput: string(output),
		File:        m.g.Config.ImageURL(dest),
		Args:        args,
	})
	return dest, err
}

func (m *Meme) makeRectangle(ctx context.Context, topLeft, bottomRight, fileDimensions Point, deltas *Deltas) (string, error) {
	op := pb.Operation_Rect
	dest := m.genFile(op)
	t := time.Now()

	// CCW
	points := Deltas{
		topLeft,
		{X: topLeft.X, Y: bottomRight.Y},
		bottomRight,
		{X: bottomRight.X, Y: topLeft.Y},
	}
	color := "blue"
	if deltas != nil {
		color = "red"
		d2 := *deltas
		points[0] = points[0].Add(d2[0])
		points[1] = points[1].Add(d2[1])
		// these are weird since distort deltas don't go in same direction...
		points[2] = points[2].Add(d2[3])
		points[3] = points[3].Add(d2[2])

	}

	args := []string{
		"-size",
		fileDimensions.Dim(),
		"xc:transparent",
		"-fill", "transparent",
		"-stroke", color,
		"-draw", fmt.Sprintf(`polyline %s %s %s %s %s`,
			points[0].Comma(),
			points[1].Comma(),
			points[2].Comma(),
			points[3].Comma(),
			points[0].Comma()),
		dest,
	}
	cmd := RunCommand(ctx, "magick", args...)
	output, err := cmd.CombinedOutput()
	m.OpLog = append(m.OpLog, &pb.OpLog{Step: m.CurrentStep,
		Op:          op,
		Duration:    time.Since(t).String(),
		DebugOutput: string(output),
		File:        m.g.Config.ImageURL(dest),
		Args:        args,
	})
	return dest, err
}

func (m *Meme) makeText(ctx context.Context, text, color string, hint Point) (string, error) {
	op := pb.Operation_Text
	dest := m.genFile(op)
	t := time.Now()

	if color == "" {
		color = "orange"
	}
	args := []string{
		"-background",
		"transparent",
		"-fill", color,
		"-font", m.g.Config.Font,
		// "-pointsize", "20",
		"-size", hint.Dim(),
		"-gravity", "center",
		"caption:" + text,
		dest,
	}
	cmd := RunCommand(ctx, "magick", args...)
	output, err := cmd.CombinedOutput()
	m.OpLog = append(m.OpLog, &pb.OpLog{Step: m.CurrentStep,
		Op:          op,
		Duration:    time.Since(t).String(),
		DebugOutput: string(output),
		File:        m.g.Config.ImageURL(dest),
		Args:        args,
	})
	return dest, err
}

// / composites A onto B, given the top-left corner position of A
func (m *Meme) composite(ctx context.Context, fileNameA, fileNameB string, topLeft Point) (string, error) {
	op := pb.Operation_Composite
	dest := m.genFile(op)
	t := time.Now()
	args := []string{
		"composite",
		"-geometry",
		fmt.Sprintf("+%d+%d", topLeft.X, topLeft.Y),
		fileNameA,
		fileNameB,
		dest,
	}
	cmd := RunCommand(ctx, "magick", args...)
	output, err := cmd.CombinedOutput()
	m.OpLog = append(m.OpLog, &pb.OpLog{Step: m.CurrentStep,
		Op:          op,
		Duration:    time.Since(t).String(),
		DebugOutput: string(output),
		File:        m.g.Config.ImageURL(dest),
		Args:        args,
	})
	return dest, err
}

func (m *Meme) cpFile(ctx context.Context, fileNameA, fileNameB string) error {
	args := []string{fileNameA, fileNameB}
	cmd := RunCommand(ctx, "cp", args...)
	_, err := cmd.CombinedOutput()
	return err
}

// ControlPointDelta represents the delta between 2 control points
type ControlPointDelta struct {
	P1 Point
	P2 Point
}

// DistortPayload is the payload to the distort function
type DistortPayload struct {
	ControlPoints [4]ControlPointDelta
}

func (d *DistortPayload) applyDelta(delta *Deltas) error {
	if delta == nil {
		return nil
	}
	for x := range d.ControlPoints {
		d.ControlPoints[x].P2 = d.ControlPoints[x].P2.Add(delta[x])
	}
	return nil
}

// ToIMString generates a string for imagemagick
func (d *DistortPayload) ToIMString() string {
	cps := make([]string, 4)
	for a, p := range d.ControlPoints {
		cps[a] = fmt.Sprintf("%d,%d,%d,%d", p.P1.X, p.P1.Y, p.P2.X, p.P2.Y)
	}
	return strings.Join(cps, "  ")
}
func (d *DistortPayload) set() bool {
	if d == nil || len(d.ControlPoints) != 4 {
		return false
	}
	return true
}

// BuildBase creates a base distortion payload that's effectively a noop
func (p *Point) BuildBase() DistortPayload {
	return DistortPayload{
		ControlPoints: [4]ControlPointDelta{
			{P1: Point{}, P2: Point{}},
			{P1: Point{X: 0, Y: p.Y}, P2: Point{X: 0, Y: p.Y}},
			{P1: Point{X: p.X, Y: 0}, P2: Point{X: p.X, Y: 0}},
			{P1: Point{p.X, p.Y}, P2: Point{p.X, p.Y}},
		},
	}
}

// RunCommand execs a command
func RunCommand(ctx context.Context, name string, arg ...string) *exec.Cmd {
	log.WithFields(log.Fields{
		"command": name,
		"args":    arg,
	}).Info("Running command")
	return exec.CommandContext(ctx, name, arg...)
}

// GetFile fetches the file from base64 payload or frmo url
func (m *Meme) GetFile(ctx context.Context, t *pb.ImageInput) (string, error) {

	if strings.HasPrefix(t.URL, "data:") {

		image, err := util.ImageFromBase64(t.URL)
		if err != nil {
			return "", err
		}
		return util.SaveImage(image)
	} else if strings.HasPrefix(t.URL, "http") {
		return util.DownloadImage(ctx, t.URL)
	} else {
		return "", fmt.Errorf("could not get file from input: %v", t)
	}
}
