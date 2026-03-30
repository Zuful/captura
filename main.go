package main

import (
	"fmt"
	"log"
	"os"
	"os/exec"
	"runtime"
	"time"

	"github.com/Zuful/captura/internal/server"
)

func main() {
	if len(os.Args) < 2 {
		fmt.Fprintf(os.Stderr, "Usage: captura <video-file>\n")
		os.Exit(1)
	}

	videoPath := os.Args[1]
	port := 8765

	url := fmt.Sprintf("http://localhost:%d", port)

	go func() {
		time.Sleep(500 * time.Millisecond)
		openBrowser(url)
	}()

	log.Printf("Starting Captura at %s", url)
	server.Start(videoPath, port)
}

func openBrowser(url string) {
	var cmd *exec.Cmd
	switch runtime.GOOS {
	case "darwin":
		cmd = exec.Command("open", url)
	case "linux":
		cmd = exec.Command("xdg-open", url)
	default:
		fmt.Printf("Open your browser at: %s\n", url)
		return
	}

	if err := cmd.Start(); err != nil {
		fmt.Printf("Could not open browser automatically. Visit: %s\n", url)
	}
}
