package util

import (
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
	// type args struct {
	// 	img image.Image
	// }
	// tests := []struct {
	// 	name    string
	// 	args    args
	// 	want    string
	// 	wantErr bool
	// }{
	// 	// TODO: Add test cases.
	// }
	// for _, tt := range tests {
	// 	t.Run(tt.name, func(t *testing.T) {
	// 		got, err := ImageToBase64String(tt.args.img)
	// 		if (err != nil) != tt.wantErr {
	// 			t.Errorf("ImageToBase64String() error = %v, wantErr %v", err, tt.wantErr)
	// 			return
	// 		}
	// 		if got != tt.want {
	// 			t.Errorf("ImageToBase64String() = %v, want %v", got, tt.want)
	// 		}
	// 	})
	// }
}
