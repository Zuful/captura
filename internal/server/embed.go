package server

import (
	"embed"
	"io/fs"
	"net/http"
)

// frontendFS holds the embedded React/Vite build output.
// It is initialized by passing an embed.FS to server.Start.
var frontendFS http.FileSystem

// initFrontend initialises frontendFS from the provided embed.FS.
// The FS must contain a "frontend/dist" sub-tree.
func initFrontend(embedded embed.FS) {
	sub, err := fs.Sub(embedded, "frontend/dist")
	if err != nil {
		return
	}
	frontendFS = http.FS(sub)
}
