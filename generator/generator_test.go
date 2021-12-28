package generator

import (
	"context"
	"os"
	"testing"

	"github.com/nickysemenza/gomeme/proto"
	"github.com/nickysemenza/gomeme/util"
	"github.com/spf13/viper"
	"github.com/stretchr/testify/require"
)

func TestApplyDelta(t *testing.T) {
	original := DistortPayload{ControlPoints: [4]ControlPointDelta{
		{P1: Point{}, P2: Point{}},
		{P1: Point{}, P2: Point{}},
		{P1: Point{}, P2: Point{}},
		{P1: Point{}, P2: Point{}},
	}}
	d1 := Deltas{{2, 4}, {}, {3, 0}, {}}

	err := original.applyDelta(&d1)
	require.NoError(t, err)

	require.EqualValues(t, d1[0], original.ControlPoints[0].P2)
}

func TestBuildPrintPayload(t *testing.T) {
	dimensions := Point{2, 3}
	payload := dimensions.BuildBase()
	require.Equal(t, "0,0,0,0  0,3,0,3  2,0,2,0  2,3,2,3",
		payload.ToIMString())
}

func TestMakeText(t *testing.T) {
	viper.AutomaticEnv()
	m := Meme{g: mustConfig(t)}
	ctx := context.Background()
	file, err := m.makeText(ctx, "hello", "", Point{200, 200})
	require.NoError(t, err, m.OpLog)
	i, err := util.LoadImage(file)
	require.NoError(t, err)
	require.Equal(t, i.Bounds().Dx(), 200)
	require.Equal(t, i.Bounds().Dy(), 200)
}
func TestMakeImage(t *testing.T) {
	m := Meme{g: mustConfig(t)}
	ctx := context.Background()
	file, err := m.makeRectangle(ctx, Point{20, 20}, Point{100, 100}, Point{200, 200}, &Deltas{{2, 4}, {}, {3, 0}, {}})
	require.NoError(t, err, m.OpLog)
	i, err := util.LoadImage(file)
	require.NoError(t, err)
	require.Equal(t, i.Bounds().Dx(), 200)
	require.Equal(t, i.Bounds().Dy(), 200)
}

func TestGenerate(t *testing.T) {
	viper.AutomaticEnv()
	c, err := LoadConfig()
	require.NoError(t, err)
	c.Font = viper.GetString("FONT")

	g := Generator{Config: c}
	ctx := context.Background()

	testCases := []struct {
		desc         string
		TargetInputs []*proto.TargetInput
		debug        bool
	}{
		{
			desc: "base text",
			TargetInputs: []*proto.TargetInput{
				{Input: &proto.TargetInput_TextInput{TextInput: &proto.TextInput{Text: "hello"}}},
				{Input: &proto.TargetInput_TextInput{TextInput: &proto.TextInput{Text: "world"}}},
			},
		},
		{
			desc: "debug mode, stretch image ",
			TargetInputs: []*proto.TargetInput{
				{Input: &proto.TargetInput_ImageInput{ImageInput: &proto.ImageInput{URL: "https://via.placeholder.com/350x150", Stretch: true}}},
				{Input: &proto.TargetInput_ImageInput{ImageInput: &proto.ImageInput{URL: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQYV2NgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII=", Stretch: false}}},
			},
			debug: true,
		},
	}
	for _, tC := range testCases {
		t.Run(tC.desc, func(t *testing.T) {
			m, err := g.Process(ctx, &proto.CreateMemeParams{
				TemplateName: "office1",
				TargetInputs: tC.TargetInputs,
				Debug:        &tC.debug,
			})
			require.NoError(t, err, m.OpLog)
			require.NotNil(t, m)
			require.Contains(t, g.GetMemeURL(m), "png")

			// redo with base64 input?
			m2, err := g.ProcessBase64Payload(ctx, m.hash)
			require.NoError(t, err)
			require.NotNil(t, m2)
		})
	}

}
func mustConfig(t *testing.T) *Generator {
	viper.AutomaticEnv()
	c, err := LoadConfig()
	require.NoError(t, err)
	c.Font = viper.GetString("FONT")
	_ = os.Mkdir(c.TmpDir(), 0777) //todo: allow `tmp/` dir to be customised in tests
	return &Generator{Config: c}
}
