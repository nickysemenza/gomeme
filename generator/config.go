package generator

import (
	"context"

	"github.com/pkg/errors"
	"github.com/spf13/viper"

	"github.com/nickysemenza/gomeme/util"
)

//Config contains all templates, as well as config data
type Config struct {
	Templates map[string]Template `json:"templates"`
}

//Point represents an x,y coordinate
type Point struct {
	X int `json:"x"`
	Y int `json:"y"`
}

//Add returns a new Point that's the result of all the values being added.
func (p Point) Add(p2 Point) Point {
	return Point{
		X: p.X + p2.X,
		Y: p.Y + p2.Y,
	}
}

//Target represents a location where input can be placed on a meme
type Target struct {
	FriendlyName string   `json:"friendly_name" mapstructure:"friendly_name"`
	TopLeft      Point    `json:"top_left" mapstructure:"top_left"`
	Size         Point    `json:"size"`
	Deltas       [4]Point `json:"deltas"`
}

//Template is a template for a meme
type Template struct {
	Size    Point    `json:"size"`
	Targets []Target `json:"targets"`
	File    string   `json:"file"`
}

//TargetInput represents the input for a specific target
type TargetInput struct {
	FileName string `json:"file_name,omitempty"`
	URL      string
	//TODO: add base64 image, url
	//TODO: add modifiers
}

//GetFile returns a filename representing the contents of the input
func (t *TargetInput) GetFile(ctx context.Context) (string, error) {
	switch {
	case t.FileName != "":
		return t.FileName, nil
	case t.URL != "":
		return util.DownloadImage(ctx, t.URL)
	}
	return "", errors.New("could not get file from input")
}

//Input represents a meme creation request input
type Input struct {
	TemplateName string        `json:"template_name,omitempty"`
	TargetInputs []TargetInput `json:"target_inputs,omitempty"`
}

//LoadConfig loads config
func LoadConfig() (*Config, error) {
	viper.SetConfigName("gomeme")
	viper.AddConfigPath(".")
	err := viper.ReadInConfig()
	if err != nil {
		return nil, errors.Wrap(err, "error config file")
	}
	c := Config{}

	err = viper.UnmarshalKey("templates", &c.Templates)

	//TODO make sure all template images exist
	return &c, err
}
