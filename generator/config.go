package generator

import (
	"fmt"
	"path/filepath"

	"github.com/spf13/viper"
)

//Config contains all templates, as well as config data
type Config struct {
	Templates map[string]Template `json:"templates"`
	Listen    Listen
	Font      string
	BaseAPI   string
	BaseDir   string
}

// TmpDir returns the temp dir
func (c *Config) TmpDir() string {
	return filepath.Join(c.BaseDir, "tmp")
}

// Listen contains the port and address to listen on
type Listen struct {
	Host     string
	HTTPPort int
	GRPCPort int
}

//Point represents an x,y coordinate
type Point struct {
	X int32 `json:"x"`
	Y int32 `json:"y"`
}

// Comma prints the point as csv
func (p Point) Comma() string {
	return fmt.Sprintf("%d,%d", p.X, p.Y)
}

// Dim prints the point as dimension
func (p Point) Dim() string {
	return fmt.Sprintf("%dx%d", p.X, p.Y)
}

//Add returns a new Point that's the result of all the values being added.
func (p Point) Add(p2 Point) Point {
	return Point{
		X: p.X + p2.X,
		Y: p.Y + p2.Y,
	}
}

// Deltas holds the 4 corners of a distortion
type Deltas [4]Point

//Target represents a location where input can be placed on a meme
type Target struct {
	FriendlyName string  `json:"friendly_name" mapstructure:"friendly_name"`
	TopLeft      Point   `json:"top_left" mapstructure:"top_left"`
	Size         Point   `json:"size"`
	Deltas       *Deltas `json:"deltas"`
}

//Template is a template for a meme
type Template struct {
	Size    Point    `json:"size"`
	Targets []Target `json:"targets"`
	File    string   `json:"file"`
}

//LoadConfig loads config
func LoadConfig() (*Config, error) {
	viper.SetConfigName("gomeme")
	viper.AddConfigPath(".")
	viper.AddConfigPath("..")
	err := viper.ReadInConfig()
	if err != nil {
		return nil, fmt.Errorf("error config file: %w", err)
	}
	c := Config{}
	fmt.Println()
	c.BaseDir = filepath.Dir(viper.ConfigFileUsed())

	err = viper.UnmarshalKey("templates", &c.Templates)

	//TODO make sure all template images exist
	return &c, err
}
