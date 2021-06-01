package generator

import (
	"context"
	"fmt"
	"os/exec"
	"strings"
	"time"

	pb "github.com/nickysemenza/gomeme/proto"
	"github.com/nickysemenza/gomeme/util"

	"github.com/davecgh/go-spew/spew"
	uuid "github.com/satori/go.uuid"
	log "github.com/sirupsen/logrus"
)

//Operation is a step
type Operation string

//Operations
const (
	OpShrink    Operation = "shrink"
	OpDistort   Operation = "distort"
	OpComposite Operation = "composite"
)

//Generator is the singleton application
type Generator struct {
	Config *Config
}

//OpLog represents the log of an operation
type OpLog struct {
	Step   int           `json:"step,omitempty"`
	Op     Operation     `json:"op,omitempty"`
	Time   time.Duration `json:"time,omitempty"`
	Output string        `json:"output,omitempty"`
	File   string        `json:"file,omitempty"`
}

//Meme is a meme
type Meme struct {
	UUID        string  `json:"uuid,omitempty"`
	CurrentStep int     `json:"current_step,omitempty"`
	OpLog       []OpLog `json:"op_log,omitempty"`
	ResultFile  string  `json:"file,omitempty"`
}

//Process makes a meme
func (g *Generator) Process(ctx context.Context, req *pb.CreateMemeParams) (*Meme, error) {
	templateName := req.TemplateName
	template, ok := g.Config.Templates[templateName]
	if !ok {
		return nil, fmt.Errorf("Process: template %s does not exist", templateName)
	}

	//TODO: ensure length of input is right
	m := Meme{
		UUID:       fmt.Sprintf("%d-%s", time.Now().Unix(), uuid.NewV4().String()),
		ResultFile: template.File,
	}

	for step, target := range template.Targets {
		m.CurrentStep = step
		input := req.TargetInputs[step]
		fileName, err := GetFile(ctx, input)
		if err != nil {
			return &m, fmt.Errorf("Process: failed to get file: %w", err)
		}
		shrunkFile, err := m.shrinkToSize(ctx, fileName, target.Size)
		if err != nil {
			return &m, fmt.Errorf("Process: failed to shrink: %w", err)
		}

		dist := target.Size.BuildBase()
		// spew.Dump(dist.ToIMString())
		err = dist.applyDelta(target.Deltas)
		if err != nil {
			return &m, fmt.Errorf("Process: failed to apply delta: %w", err)
		}
		distortedFile, err := m.distort(ctx, shrunkFile, dist)
		if err != nil {
			return &m, fmt.Errorf("Process: failed to distort: %w", err)
		}
		compositedFile, err := m.composite(ctx, distortedFile, m.ResultFile, target.TopLeft)
		if err != nil {
			return &m, fmt.Errorf("Process: failed to composite: %w", err)
		}

		if req.Debug {
			//debug overlay
			bounding, err := m.makeRectangle(ctx, target.TopLeft, target.TopLeft.Add(target.Size), template.Size, nil)
			if err != nil {
				return &m, fmt.Errorf("Process: failed to add bounding: %w", err)
			}
			compositedFile, err = m.composite(ctx, bounding, compositedFile, Point{})
			if err != nil {
				return &m, fmt.Errorf("Process: failed to composite: %w", err)
			}

			bounding, err = m.makeRectangle(ctx, target.TopLeft, target.TopLeft.Add(target.Size), template.Size, &target.Deltas)
			if err != nil {
				return &m, fmt.Errorf("Process: failed to add bounding: %w", err)
			}
			compositedFile, err = m.composite(ctx, bounding, compositedFile, Point{})
			if err != nil {
				return &m, fmt.Errorf("Process: failed to composite: %w", err)
			}
		}

		m.ResultFile = fmt.Sprintf("tmp/%s-final.png", m.UUID)
		fmt.Println(compositedFile)
		if err = m.cpFile(ctx, compositedFile, m.ResultFile); err != nil {
			return &m, fmt.Errorf("Process: failed to copy: %w", err)
		}
		// spew.Dump(dist.ToIMString())

	}
	return &m, nil
}
func (m *Meme) genFile(op Operation) string {
	return fmt.Sprintf("tmp/%s-%d-%s.png", m.UUID, m.CurrentStep, op)
}

func (m *Meme) shrinkToSize(ctx context.Context, fileName string, destSize Point) (string, error) {
	op := OpShrink
	dest := m.genFile(op)
	t := time.Now()
	args := []string{
		fileName,
		"-resize",
		fmt.Sprintf("%dx%d!", destSize.X, destSize.Y), //todo: opt to not stretch
		dest,
	}
	cmd := runCommand(ctx, "convert", args...)
	output, err := cmd.CombinedOutput()
	m.OpLog = append(m.OpLog, OpLog{m.CurrentStep, op, time.Since(t), string(output), dest})
	return dest, err
}

func (m *Meme) distort(ctx context.Context, fileName string, payload DistortPayload) (string, error) {
	op := OpDistort
	dest := m.genFile(op)
	t := time.Now()
	args := []string{
		fileName,
		"-matte",
		"-virtual-pixel",
		"transparent",
		"-distort",
		"Perspective",
		payload.ToIMString(),
		dest,
	}
	cmd := runCommand(ctx, "convert", args...)
	output, err := cmd.CombinedOutput()
	m.OpLog = append(m.OpLog, OpLog{m.CurrentStep, op, time.Since(t), string(output), dest})
	return dest, err
}

func (m *Meme) makeRectangle(ctx context.Context, topLeft, bottomRight, fileDimensions Point, deltas *[4]Point) (string, error) {
	op := OpDistort
	dest := m.genFile(op)
	t := time.Now()

	// CCW
	points := [4]Point{
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
		"-fill",
		"transparent",
		"-stroke",
		color,
		"-draw",
		fmt.Sprintf(`polyline %s %s %s %s %s`,
			points[0].Comma(),
			points[1].Comma(),
			points[2].Comma(),
			points[3].Comma(),
			points[0].Comma()),
		dest,
	}
	cmd := runCommand(ctx, "convert", args...)
	output, err := cmd.CombinedOutput()
	m.OpLog = append(m.OpLog, OpLog{m.CurrentStep, op, time.Since(t), string(output), dest})
	return dest, err
}

/// composites A onto B, given the top-left corner position of A
func (m *Meme) composite(ctx context.Context, fileNameA, fileNameB string, topLeft Point) (string, error) {
	op := OpComposite
	dest := m.genFile(op)
	t := time.Now()
	args := []string{
		"-geometry",
		fmt.Sprintf("+%d+%d", topLeft.X, topLeft.Y),
		fileNameA,
		fileNameB,
		dest,
	}
	cmd := runCommand(ctx, "composite", args...)
	output, err := cmd.CombinedOutput()
	m.OpLog = append(m.OpLog, OpLog{m.CurrentStep, op, time.Since(t), string(output), dest})
	return dest, err
}

func (m *Meme) cpFile(ctx context.Context, fileNameA, fileNameB string) error {
	spew.Dump("aaa", fileNameA, fileNameB)
	args := []string{fileNameA, fileNameB}
	cmd := runCommand(ctx, "cp", args...)
	_, err := cmd.CombinedOutput()
	return err
}

//ControlPointDelta represents the delta between 2 control points
type ControlPointDelta struct {
	P1 Point
	P2 Point
}

//DistortPayload is the payload to the distort function
type DistortPayload struct {
	ControlPoints [4]ControlPointDelta
}

func (d *DistortPayload) applyDelta(delta [4]Point) error {
	for x := range d.ControlPoints {
		d.ControlPoints[x].P2 = d.ControlPoints[x].P2.Add(delta[x])
	}
	return nil
}

//ToIMString generates a string for imagemagick
func (d *DistortPayload) ToIMString() string {
	cps := make([]string, 4)
	for a, p := range d.ControlPoints {
		cps[a] = fmt.Sprintf("%d,%d,%d,%d", p.P1.X, p.P1.Y, p.P2.X, p.P2.Y)
	}
	return strings.Join(cps, "  ")
}

//BuildBase creates a base distortion payload that's effectively a noop
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

func runCommand(ctx context.Context, name string, arg ...string) *exec.Cmd {
	log.WithFields(log.Fields{
		"command": name,
		"args":    arg,
	}).Info("Running command")
	return exec.CommandContext(ctx, name, arg...)
}

func GetFile(ctx context.Context, t *pb.TargetInput) (string, error) {
	switch t.Kind {
	case pb.TargetInput_B64:
		image, err := util.ImageFromBase64(t.Value)
		if err != nil {
			return "", err
		}
		return util.SaveImage(image)
	case pb.TargetInput_URL:
		return util.DownloadImage(ctx, t.Value)

		// case t.FileName != "":
		// 	return t.FileName, nil
	}
	return "", fmt.Errorf("could not get file from input: %v", t)
}
