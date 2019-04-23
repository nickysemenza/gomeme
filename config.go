package main

import (
	"github.com/pkg/errors"
	"github.com/spf13/viper"
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

//Target represents a location where input can be placed on a meme
type Target struct {
	FriendlyName string  `json:"friendly_name"`
	TopLeft      Point   `json:"top_left"`
	Size         Point   `json:"size"`
	Deltas       []Point `json:"deltas"` //must be length 4
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
	err := viper.ReadInConfig()
	if err != nil {
		return nil, errors.Wrap(err, "error config file")
	}
	c := Config{}

	err = viper.UnmarshalKey("templates", &c.Templates)

	return &c, err
}
