package generator

import (
	"context"
	"os"
	"testing"

	"github.com/nickysemenza/gomeme/util"
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
	m := Meme{}
	_ = os.Mkdir("tmp", 0777) //todo: allow `tmp/` dir to be customised in tests
	ctx := context.Background()
	file, err := m.makeText(ctx, "hello", Point{200, 200})
	require.NoError(t, err, m.OpLog)
	i, err := util.LoadImage(file)
	require.NoError(t, err)
	require.Equal(t, i.Bounds().Dx(), 200)
	require.Equal(t, i.Bounds().Dy(), 200)
}
func TestMakeImage(t *testing.T) {
	m := Meme{}
	_ = os.Mkdir("tmp", 0777) //todo: allow `tmp/` dir to be customised in tests
	ctx := context.Background()
	file, err := m.makeRectangle(ctx, Point{20, 20}, Point{100, 100}, Point{200, 200}, &Deltas{{2, 4}, {}, {3, 0}, {}})
	require.NoError(t, err, m.OpLog)
	i, err := util.LoadImage(file)
	require.NoError(t, err)
	require.Equal(t, i.Bounds().Dx(), 200)
	require.Equal(t, i.Bounds().Dy(), 200)
}
