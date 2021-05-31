package util

import (
	"bytes"
	"context"
	"encoding/base64"
	"fmt"
	"image"
	"image/png"

	_ "image/jpeg" //allow decoding jpeg
	_ "image/png"  //allow decoding png
	"io"
	"net/http"
	"os"

	uuid "github.com/satori/go.uuid"
)

//DownloadImage downloads an image to the local FS
func DownloadImage(ctx context.Context, url string) (string, error) {
	fileName := fmt.Sprintf("tmp/input-%s.png", uuid.NewV4().String())

	response, err := http.Get(url)
	if err != nil {
		return "", fmt.Errorf("failed to download image: %w", err)
	}
	defer response.Body.Close()

	file, err := os.Create(fileName)
	if err != nil {
		return "", fmt.Errorf("failed to create file: %w", err)
	}
	defer file.Close()

	_, err = io.Copy(file, response.Body)
	if err != nil {
		return "", fmt.Errorf("failed to write image to file: %w", err)
	}

	return fileName, nil
}

//ImageFromFile gets an image from a file
func ImageFromFile(fileName string) (image.Image, error) {

	ImageFromFile, err := os.Open(fileName)
	if err != nil {
		// Handle error
	}
	defer ImageFromFile.Close()

	// Calling the generic image.Decode() will tell give us the data
	// and type of image it is as a string. We expect "png"
	imageData, _, err := image.Decode(ImageFromFile)
	if err != nil {
		return nil, fmt.Errorf("failed to decode image: %w", err)
	}
	return imageData, nil

}

//ImageToBase64String converts an image to a base65 encoded png
func ImageToBase64String(img image.Image) (string, error) {
	var buff bytes.Buffer
	png.Encode(&buff, img)
	data := base64.StdEncoding.EncodeToString(buff.Bytes())
	return fmt.Sprintf("data:image/png;base64,%s", data), nil
}
