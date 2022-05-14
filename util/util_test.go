package util

import (
	"context"
	"image"
	_ "image/jpeg"
	_ "image/png"
	"testing"

	"github.com/stretchr/testify/require"
)

func TestImageToBase64String(t *testing.T) {
	r := image.Rectangle{image.Pt(0, 0), image.Pt(50, 50)}
	i := image.NewRGBA(r)

	b, err := ImageToBase64String(i)
	require.NoError(t, err)

	i2, err := ImageFromBase64(b)
	require.NoError(t, err)
	require.EqualValues(t, r, i2.Bounds())

	file, err := SaveImage(i2)
	require.NoError(t, err)

	i3, err := LoadImage(file)
	require.NoError(t, err)
	require.EqualValues(t, r, i3.Bounds())
}

func TestDownloadImage(t *testing.T) {
	file, err := DownloadImage(context.Background(), "https://dummyimage.com/350x150/fff/aaa")
	require.NoError(t, err)
	i, err := LoadImage(file)
	require.NoError(t, err)
	require.Equal(t, i.Bounds().Dx(), 350)
	require.Equal(t, i.Bounds().Dy(), 150)
}
