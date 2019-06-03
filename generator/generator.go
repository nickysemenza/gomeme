package generator

import (
	"context"
	"fmt"
	"os/exec"
	"strings"
	"time"

	"github.com/davecgh/go-spew/spew"
	"github.com/pkg/errors"
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
func (g *Generator) Process(ctx context.Context, input Input) (*Meme, error) {
	templateName := input.TemplateName
	template, ok := g.Config.Templates[templateName]
	if !ok {
		return nil, fmt.Errorf("template %s does not exist", templateName)
	}

	//TODO: ensure length of input is right
	m := Meme{UUID: uuid.NewV4().String(), ResultFile: template.File}
	for step, target := range template.Targets {
		m.CurrentStep = step
		input := input.TargetInputs[step]
		fileName, err := input.GetFile(ctx)
		if err != nil {
			return &m, err
		}
		shrunkFile, err := m.shrinkToSize(ctx, fileName, target.Size)
		if err != nil {
			return &m, errors.Wrap(err, "failed to shrink")
		}

		dist := target.Size.BuildBase()
		// spew.Dump(dist.ToIMString())
		err = dist.applyDelta(target.Deltas)
		if err != nil {
			return &m, errors.Wrap(err, "failed to apply delta")
		}
		distortedFile, err := m.distort(ctx, shrunkFile, dist)
		if err != nil {
			return &m, errors.Wrap(err, "failed to distort")
		}
		compositedFile, err := m.composite(ctx, distortedFile, m.ResultFile, target.TopLeft)
		if err != nil {
			return &m, errors.Wrap(err, "failed to composite")
		}
		m.ResultFile = fmt.Sprintf("tmp/%s.png", m.UUID)
		fmt.Println(compositedFile)
		if err = m.cpFile(ctx, compositedFile, m.ResultFile); err != nil {
			return &m, errors.Wrap(err, "failed to copy")
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
	ControlPoints []ControlPointDelta //size 4
}

func (d *DistortPayload) applyDelta(delta []Point) error {
	switch {
	case len(delta) == 0:
		return nil // nopp
	case len(delta) != 4:
		return errors.New("must specify 0 or 4 deltas")
	}

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
		ControlPoints: []ControlPointDelta{
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