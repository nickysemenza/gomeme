package util

import (
	"bytes"
	"context"
	"encoding/base64"
	"fmt"
	"image"
	"image/jpeg"
	"image/png"
	"io/ioutil"
	"strings"

	_ "image/jpeg" //allow decoding jpeg
	_ "image/png"  //allow decoding png
	"io"
	"net/http"
	"os"
)

//DownloadImage downloads an image to the local FS
func DownloadImage(ctx context.Context, url string) (string, error) {
	file, err := ioutil.TempFile("", "dlimage.*.png")
	if err != nil {
		return "", fmt.Errorf("SaveImage: failed to create file: %w", err)
	}
	defer file.Close()

	response, err := http.Get(url)
	if err != nil {
		return "", fmt.Errorf("failed to download image: %w", err)
	}
	defer response.Body.Close()

	_, err = io.Copy(file, response.Body)
	if err != nil {
		return "", fmt.Errorf("failed to write image to file: %w", err)
	}

	return file.Name(), nil
}

//LoadImage gets an image from a file
func LoadImage(fileName string) (image.Image, error) {
	ImageFromFile, err := os.Open(fileName)
	if err != nil {
		return nil, fmt.Errorf("LoadImage: %w", err)
	}
	defer ImageFromFile.Close()

	// Calling the generic image.Decode() will tell give us the data
	// and type of image it is as a string. We expect "png"
	imageData, _, err := image.Decode(ImageFromFile)
	if err != nil {
		return nil, fmt.Errorf("LoadImage: failed to decode image: %w", err)
	}
	return imageData, nil

}

// SaveImage writes the image to file
// https://www.devdungeon.com/content/working-images-go#writing_image_to_file
func SaveImage(i image.Image) (string, error) {

	file, err := ioutil.TempFile("", "saveimage.*.png")
	if err != nil {
		return "", fmt.Errorf("SaveImage: failed to create file: %w", err)
	}
	defer file.Close()

	err = png.Encode(file, i)
	if err != nil {
		return "", fmt.Errorf("SaveImage: failed to encode: %w", err)
	}
	return file.Name(), nil
}

//ImageToBase64String converts an image to a base65 encoded png
func ImageToBase64String(img image.Image) (string, error) {
	var buff bytes.Buffer
	png.Encode(&buff, img)
	data := base64.StdEncoding.EncodeToString(buff.Bytes())
	return fmt.Sprintf("data:image/png;base64,%s", data), nil
}

// ImageFromBase64 creates an image from base64 url
// eg `data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD`
func ImageFromBase64(image string) (out image.Image, err error) {

	coI := strings.Index(string(image), ",")
	rawImage := string(image)[coI+1:]

	unbased, err := base64.StdEncoding.DecodeString(string(rawImage))
	if err != nil {
		return nil, fmt.Errorf("ImageFromBase64: failed to decode b64: %w", err)
	}

	res := bytes.NewReader(unbased)

	switch strings.TrimSuffix(image[5:coI], ";base64") {
	case "image/png":
		out, err = png.Decode(res)
		if err != nil {
			return nil, fmt.Errorf("ImageFromBase64: failed to decode png: %w", err)
		}
	case "image/jpeg":
		out, err = jpeg.Decode(res)
		if err != nil {
			return nil, fmt.Errorf("ImageFromBase64: failed to decode jpeg: %w", err)
		}
	}
	return

}
