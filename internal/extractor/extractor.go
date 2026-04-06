package extractor

import (
	"fmt"
	"image"
	_ "image/jpeg"
	_ "image/png"
	"math"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
)

// Frame represents a single extracted video frame with metadata.
type Frame struct {
	ID             string  `json:"id"`
	Timestamp      float64 `json:"timestamp"`
	Path           string  `json:"path"`
	SharpnessScore float64 `json:"sharpnessScore"`
}

// Extract uses ffmpeg to pull frames from videoPath at the given interval (seconds),
// saving them as JPEGs under outputDir. It then scores each frame for sharpness.
func Extract(videoPath string, intervalSec float64, outputDir string) ([]Frame, error) {
	if err := os.MkdirAll(outputDir, 0755); err != nil {
		return nil, fmt.Errorf("create output dir: %w", err)
	}

	// Remove any frames from a previous extraction before starting fresh
	if old, _ := filepath.Glob(filepath.Join(outputDir, "frame_*.jpg")); len(old) > 0 {
		for _, f := range old {
			os.Remove(f)
		}
	}

	// fps filter: 1 frame every intervalSec seconds
	fpsFilter := fmt.Sprintf("fps=1/%.4f", intervalSec)
	pattern := filepath.Join(outputDir, "frame_%04d.jpg")

	cmd := exec.Command("ffmpeg",
		"-i", videoPath,
		"-vf", fpsFilter,
		"-q:v", "2",
		pattern,
	)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	if err := cmd.Run(); err != nil {
		return nil, fmt.Errorf("ffmpeg extraction failed: %w", err)
	}

	entries, err := filepath.Glob(filepath.Join(outputDir, "frame_*.jpg"))
	if err != nil {
		return nil, fmt.Errorf("glob frames: %w", err)
	}

	frames := make([]Frame, 0, len(entries))
	for i, path := range entries {
		// Derive timestamp from frame index and interval
		timestamp := float64(i) * intervalSec

		// Build a stable ID from the filename (without extension)
		base := filepath.Base(path)
		id := strings.TrimSuffix(base, filepath.Ext(base))

		score := analyzeSharpness(path)

		frames = append(frames, Frame{
			ID:             id,
			Timestamp:      timestamp,
			Path:           path,
			SharpnessScore: score,
		})
	}

	return frames, nil
}

// analyzeSharpness reads the image at imagePath and returns a sharpness score
// in the range [0, 100] based on the variance of grayscale pixel intensities.
// Higher variance generally indicates a sharper image.
func analyzeSharpness(imagePath string) float64 {
	f, err := os.Open(imagePath)
	if err != nil {
		return 0
	}
	defer f.Close()

	img, _, err := image.Decode(f)
	if err != nil {
		return 0
	}

	bounds := img.Bounds()
	width := bounds.Max.X - bounds.Min.X
	height := bounds.Max.Y - bounds.Min.Y
	total := width * height

	if total == 0 {
		return 0
	}

	// Collect grayscale values
	pixels := make([]float64, 0, total)
	var sum float64

	for y := bounds.Min.Y; y < bounds.Max.Y; y++ {
		for x := bounds.Min.X; x < bounds.Max.X; x++ {
			r, g, b, _ := img.At(x, y).RGBA()
			// Convert 16-bit channels to 8-bit, then compute luminance
			gray := 0.299*float64(r>>8) + 0.587*float64(g>>8) + 0.114*float64(b>>8)
			pixels = append(pixels, gray)
			sum += gray
		}
	}

	mean := sum / float64(total)

	var variance float64
	for _, v := range pixels {
		diff := v - mean
		variance += diff * diff
	}
	variance /= float64(total)

	// Normalize to 0-100. A variance of ~2000 is considered very sharp.
	const maxVariance = 2000.0
	score := math.Min(variance/maxVariance*100.0, 100.0)

	return score
}
