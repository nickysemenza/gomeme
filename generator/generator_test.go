package generator

import (
	"testing"

	"github.com/stretchr/testify/require"
)

func TestApplyDelta(t *testing.T) {
	original := DistortPayload{ControlPoints: []ControlPointDelta{
		{P1: Point{}, P2: Point{}},
		{P1: Point{}, P2: Point{}},
		{P1: Point{}, P2: Point{}},
		{P1: Point{}, P2: Point{}},
	}}
	d1 := []Point{Point{2, 4}, Point{}, Point{3, 0}, Point{}}
	d2 := []Point{Point{}, Point{}, Point{}}

	require.Nil(t, original.applyDelta([]Point{}))
	require.Error(t, original.applyDelta(d2))
	require.Nil(t, original.applyDelta(d1))

	require.EqualValues(t, d1[0], original.ControlPoints[0].P2)
}

func TestBuildPrintPayload(t *testing.T) {
	dimensions := Point{2, 3}
	payload := dimensions.BuildBase()
	require.Equal(t, "0,0,0,0  0,3,0,3  2,0,2,0  2,3,2,3",
		payload.ToIMString())
}
