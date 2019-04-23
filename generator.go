package main

import (
	"fmt"
	"os/exec"
	"strings"
	"time"

	uuid "github.com/satori/go.uuid"
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
	Step   int
	Op     Operation
	Time   time.Duration
	Output string
}

//Meme is a meme
type Meme struct {
	UUID        string
	CurrentStep int
	OpLog       []OpLog
}

//Process makes a meme
func (g *Generator) Process(input Input) (*Meme, error) {
	templateName := input.TemplateName
	template, ok := g.Config.Templates[templateName]
	if !ok {
		return nil, fmt.Errorf("template %s does not exist", templateName)
	}

	m := Meme{UUID: uuid.NewV4().String()}
	resultFile := template.File
	for step, target := range template.Targets {
		m.CurrentStep = step
		input := input.TargetInputs[step]
		shrunkFile, err := m.shrinkToSize(input.FileName, target.Size)
		if err != nil {
			return &m, err
		}

		dist := target.Size.BuildBase()
		// spew.Dump(dist.ToIMString())
		dist.applyDelta(target.Deltas)
		distortedFile, err := m.distort(shrunkFile, dist)
		if err != nil {
			return &m, err
		}
		resultFile, err = m.composite(distortedFile, resultFile, target.TopLeft)
		if err != nil {
			return &m, err
		}
		// spew.Dump(dist.ToIMString())

	}
	return &m, nil
}
func (m *Meme) genFile(op Operation) string {
	return fmt.Sprintf("tmp/%s-%d-%s.png", m.UUID, m.CurrentStep, op)
}

func (m *Meme) shrinkToSize(fileName string, destSize Point) (string, error) {
	op := OpShrink
	dest := m.genFile(op)
	t := time.Now()
	args := []string{
		fileName,
		"-resize",
		fmt.Sprintf("%dx%d!", destSize.X, destSize.Y), //todo: opt to not stretch
		dest,
	}
	cmd := exec.Command("convert", args...)
	output, err := cmd.CombinedOutput()
	m.OpLog = append(m.OpLog, OpLog{m.CurrentStep, op, time.Since(t), string(output)})
	return dest, err
}

func (m *Meme) distort(fileName string, payload DistortPayload) (string, error) {
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
	cmd := exec.Command("convert", args...)
	output, err := cmd.CombinedOutput()
	m.OpLog = append(m.OpLog, OpLog{m.CurrentStep, op, time.Since(t), string(output)})
	return dest, err
}

/// composites A onto B, given the top-left corner position of A
func (m *Meme) composite(fileNameA, fileNameB string, topLeft Point) (string, error) {
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
	cmd := exec.Command("composite", args...)
	output, err := cmd.CombinedOutput()
	m.OpLog = append(m.OpLog, OpLog{m.CurrentStep, op, time.Since(t), string(output)})
	return dest, err
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

func (d *DistortPayload) applyDelta(delta []Point) {
	//todo: check both are len 4
	for x := range d.ControlPoints {
		d.ControlPoints[x].P2 = d.ControlPoints[x].P2.Add(delta[x])
	}
}

//ToIMString generates a string for imagemagick
func (d *DistortPayload) ToIMString() string {
	cps := make([]string, 4)
	for a, p := range d.ControlPoints {
		cps[a] = fmt.Sprintf("%d,%d,%d,%d", p.P1.X, p.P1.Y, p.P2.X, p.P2.Y)
	}
	return strings.Join(cps, "  ")
}

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
