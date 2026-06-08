# gomeme
_or, a glorified ImageMagick wrapper_

generate memes from templates 👌

Each meme template has one or more "targets". These are the locations where the customization is applied. For example the infamous drake meme template has 2 targets on the right half of the image, one for each pane where your own content goes. These targets are defined by the dimensions of a bounding box, as well as the coordinate of the top left corner. However, some templates have targets which are not describable via a rectangle in 2D space. You can skew/distort the target by moving each of the 4 corners in 2D space, by speciying and X and Y delta for each point. Detail on these transformations can be found in [ImageMagick's Control Point documentation](http://www.imagemagick.org/Usage/distorts/#control_points).

The process for generating a meme is as follows:
1. For each target:
   1. Obtain the user input image, (download from url, base64 decode)
   2. Shrink it to the size constraints of the bounding box (stretch vs center vs. scale, TODO)
   3. If specified, distort by applying IM control point deltas
   4. Composite it onto (a copy of) the template
2. Return the template with the user input composited on top of the target!
3. Done!

`x,y->x2,y2`

Example: TODO


```
spot to place: 668x498
A: x: right 178
B: y: up -93
C: y: down 40
D: x: left -158
target top left: +19,+42


convert in1.png -resize 668x498\!  step1.png
convert step1.png -matte -virtual-pixel transparent -distort Perspective '0,0,178,0  0,498,0,405  668,0,668,40  668,498,510,498' step2.png
composite -geometry  +19+42 step2.png templates/office_copy.jpg composite.png
```

## TODO

* emoji
* rotation, in addition to skew
* text support (text -> image)
* ability to cetner, stretch, or nothing
* support the target being rotated or cropped
* API
* example in readme of how the distortion works
* cache each step
* concurrently run steps and then combine at the end
* tracing
* gRPC
* UI