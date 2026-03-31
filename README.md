# Captura

A lightweight, self-contained tool for extracting and selecting video frames to use as thumbnails. Run it against a video file, a browser opens automatically, and you pick the frames you want — then export them to disk.

![dark UI, frame grid with timecodes and sharpness scores](https://lh3.googleusercontent.com/aida/ADBb0ujKPOmY-JYA25qC1YC-5mxT_eCNzmu6Fl3i4Kc7lvyQjFK6kIzeLj0ceWyOAm2kP1Ql9GUPnQDPolivdeVzYoyp3KEd1SwPZzjJubPg3oUeFrbyeD8mMxTdQt2bqOrH2tiK-o3aI8HQWBAMCb5ddVu-zitOHH7FWV1WY6i3GHviuPFt21Ch7hdutGYSYdDMdNlQpwQxkdSUnHxgmxz_FSOB0Ytu8rCE6yPyEWoCTIKI1spDh9h9kY8KoA)

## How it works

1. Captura spawns **ffmpeg** to extract one JPEG frame every N seconds from your video.
2. Each frame is scored for **sharpness** using a Laplacian variance algorithm (grayscale pixel variance → 0–100 score). Blurry frames get a low score; sharp, detailed frames score high.
3. A Go HTTP server serves the frames and a React/Vite frontend from a single self-contained binary (no separate install needed).
4. You browse the frame grid in your browser, select the frames you want, and click **Export** to copy them to disk.

## Requirements

- **Go** 1.19+
- **Node.js** 18+ and **npm** (build step only)
- **ffmpeg** installed and available in `$PATH`

## Build

```bash
make build
```

This installs frontend dependencies, compiles the React app, and embeds it into a single self-contained Go binary.

If you don't have `make`, run the steps manually:

```bash
cd frontend && npm install && npm run build && cd ..
go build -o captura .
```

## Usage

```bash
./captura <video-file>
```

Example:

```bash
./captura ~/Videos/footage.mp4
```

Captura starts a local server on port **8765** and opens `http://localhost:8765` in your default browser automatically.

### Workflow

1. **Set interval** — choose how many seconds between extracted frames (1s, 2s, 5s, 10s) using the dropdown in the top bar.
2. **Extract** — click the Extract button. ffmpeg runs and the frame grid populates.
3. **Select frames** — click any frame to toggle selection (blue border = selected). Use **Select All** / **Deselect All** in the bottom bar as needed.
4. **Export** — click the Export button. Selected frames are copied to `~/Desktop/captura-export/`.

## API

The Go backend exposes a small REST API (useful for scripting or testing):

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/extract` | Start extraction. Body: `{"interval": 2.0}` |
| `GET` | `/api/frames` | List all extracted frames with metadata |
| `GET` | `/api/frames/{id}` | Serve the JPEG image for a frame |
| `POST` | `/api/export` | Export frames. Body: `{"ids": [...], "outputDir": "/path"}` |

Frame objects returned by the API:

```json
{
  "id": "frame_0001",
  "timestamp": 2.0,
  "path": "/tmp/captura-xxx/frame_0001.jpg",
  "sharpnessScore": 74.3
}
```

## Development

Run the backend and frontend separately for hot-reload during development:

```bash
# Terminal 1 — Go server (proxied by Vite)
go run .

# Terminal 2 — Vite dev server with HMR
cd frontend && npm run dev
```

The Vite dev server proxies all `/api` requests to `localhost:8765`.

## Stack

- **Backend**: Go + [chi](https://github.com/go-chi/chi) router, ffmpeg subprocess, Laplacian sharpness analysis
- **Frontend**: React 19, Vite 8, Tailwind CSS v4
- **Embedding**: `//go:embed frontend/dist` — the built frontend is baked into the binary at compile time

## License

MIT
