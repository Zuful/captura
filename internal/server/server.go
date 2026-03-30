package server

import (
	"embed"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"

	"github.com/Zuful/captura/internal/extractor"
)

// Server holds the application state for a single session.
type Server struct {
	videoPath string
	outputDir string
	frames    []extractor.Frame
}

// Start creates the server, wires up routes, and begins listening.
func Start(videoPath string, port int, embedded embed.FS) {
	initFrontend(embedded)

	tmpDir, err := os.MkdirTemp("", "captura-*")
	if err != nil {
		log.Fatalf("failed to create temp dir: %v", err)
	}

	s := &Server{
		videoPath: videoPath,
		outputDir: tmpDir,
	}

	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	// API routes
	r.Post("/api/extract", s.handleExtract)
	r.Get("/api/frames", s.handleListFrames)
	r.Get("/api/frames/{id}", s.handleGetFrame)
	r.Post("/api/export", s.handleExport)

	// Frontend — served from embedded dist or placeholder
	r.Get("/*", s.handleFrontend)

	addr := fmt.Sprintf(":%d", port)
	log.Printf("Listening on %s", addr)
	if err := http.ListenAndServe(addr, r); err != nil {
		log.Fatalf("server error: %v", err)
	}
}

// handleExtract triggers frame extraction.
//
// POST /api/extract
// Body: {"interval": 2.0}
func (s *Server) handleExtract(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Interval float64 `json:"interval"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.Interval <= 0 {
		http.Error(w, "invalid request body; expected {\"interval\": <seconds>}", http.StatusBadRequest)
		return
	}

	frames, err := extractor.Extract(s.videoPath, req.Interval, s.outputDir)
	if err != nil {
		http.Error(w, fmt.Sprintf("extraction failed: %v", err), http.StatusInternalServerError)
		return
	}

	s.frames = frames
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(frames)
}

// handleListFrames returns all currently extracted frames.
//
// GET /api/frames
func (s *Server) handleListFrames(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	if s.frames == nil {
		json.NewEncoder(w).Encode([]extractor.Frame{})
		return
	}
	json.NewEncoder(w).Encode(s.frames)
}

// handleGetFrame serves the image file for a specific frame by ID.
//
// GET /api/frames/{id}
func (s *Server) handleGetFrame(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	for _, f := range s.frames {
		if f.ID == id {
			http.ServeFile(w, r, f.Path)
			return
		}
	}

	http.Error(w, "frame not found", http.StatusNotFound)
}

// handleExport copies selected frames to a user-specified output directory.
//
// POST /api/export
// Body: {"ids": ["frame_0001", ...], "outputDir": "/path/to/save"}
func (s *Server) handleExport(w http.ResponseWriter, r *http.Request) {
	var req struct {
		IDs       []string `json:"ids"`
		OutputDir string   `json:"outputDir"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	if err := os.MkdirAll(req.OutputDir, 0755); err != nil {
		http.Error(w, fmt.Sprintf("cannot create output dir: %v", err), http.StatusInternalServerError)
		return
	}

	// Build a quick lookup map
	frameByID := make(map[string]extractor.Frame, len(s.frames))
	for _, f := range s.frames {
		frameByID[f.ID] = f
	}

	var exported []string
	for _, id := range req.IDs {
		f, ok := frameByID[id]
		if !ok {
			continue
		}
		dest := filepath.Join(req.OutputDir, filepath.Base(f.Path))
		if err := copyFile(f.Path, dest); err != nil {
			http.Error(w, fmt.Sprintf("failed to copy %s: %v", id, err), http.StatusInternalServerError)
			return
		}
		exported = append(exported, dest)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{
		"exported": exported,
		"count":    len(exported),
	})
}

// handleFrontend serves the embedded React app or a placeholder page.
//
// GET /*
func (s *Server) handleFrontend(w http.ResponseWriter, r *http.Request) {
	if frontendFS != nil {
		http.FileServer(frontendFS).ServeHTTP(w, r)
		return
	}

	// Placeholder until the frontend is built
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	fmt.Fprint(w, placeholderHTML)
}

const placeholderHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Captura</title>
  <style>
    body { font-family: system-ui, sans-serif; display: flex; align-items: center;
           justify-content: center; height: 100vh; margin: 0; background: #0f0f0f; color: #e0e0e0; }
    .card { text-align: center; padding: 2rem; border: 1px solid #333; border-radius: 8px; }
    code { background: #1e1e1e; padding: 0.2em 0.5em; border-radius: 4px; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Captura</h1>
    <p>Frontend not built yet.</p>
    <p>Run <code>make build</code> or <code>make dev-frontend</code> to start the React app.</p>
    <p>API is live at <code>/api/</code></p>
  </div>
</body>
</html>`

// copyFile copies src to dst, creating dst if needed.
func copyFile(src, dst string) error {
	in, err := os.Open(src)
	if err != nil {
		return err
	}
	defer in.Close()

	out, err := os.Create(dst)
	if err != nil {
		return err
	}
	defer out.Close()

	_, err = io.Copy(out, in)
	return err
}
