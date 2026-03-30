package server

import (
	"io/fs"
	"net/http"
)

// frontendFS holds the embedded React/Vite build output.
//
// The frontend/dist directory is populated by running:
//
//	cd frontend && npm run build
//
// Until then, frontendFS is nil and server.go falls back to the placeholder HTML page.
//
// Uncomment the lines below once the frontend has been scaffolded and built at least once:
//
//	//go:embed frontend/dist
//	var embeddedFrontend embed.FS
//
// Then replace the nil assignment with:
//
//	sub, _ := fs.Sub(embeddedFrontend, "frontend/dist")
//	frontendFS = http.FS(sub)

// frontendFS is nil until the embed directive above is activated.
var frontendFS http.FileSystem

// initFrontend can be called from an init() once the embed is wired up.
func initFrontend(embedded fs.FS) {
	sub, err := fs.Sub(embedded, "frontend/dist")
	if err != nil {
		return
	}
	frontendFS = http.FS(sub)
}
