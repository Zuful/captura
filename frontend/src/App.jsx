import { useState, useEffect } from 'react'
import TopBar from './components/TopBar'
import FrameGrid from './components/FrameGrid'
import BottomBar from './components/BottomBar'
import UploadView from './components/UploadView'

export default function App() {
  const [videoLoaded, setVideoLoaded] = useState(null) // null = loading
  const [frames, setFrames] = useState([])
  const [selected, setSelected] = useState(new Set())
  const [extracting, setExtracting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [videoName, setVideoName] = useState('')
  const [interval, setInterval] = useState(2)
  const [exportDir, setExportDir] = useState('~/Desktop/captura-export')
  const [exportFormat, setExportFormat] = useState('landscape')

  useEffect(() => {
    fetch('/api/status')
      .then((r) => r.json())
      .then((data) => {
        setVideoLoaded(data.videoLoaded)
        if (data.videoName) setVideoName(data.videoName)
      })
      .catch(() => setVideoLoaded(false))
  }, [])

  useEffect(() => {
    if (!videoLoaded) return
    fetch('/api/frames')
      .then((r) => r.json())
      .then((data) => setFrames(data || []))
      .catch(() => {})
  }, [videoLoaded])

  function handleVideoLoaded(name) {
    setVideoName(name)
    setVideoLoaded(true)
    setFrames([])
    setSelected(new Set())
  }

  function handleToggle(id) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function handleSelectAll() {
    setSelected(new Set(frames.map((f) => f.id)))
  }

  function handleDeselectAll() {
    setSelected(new Set())
  }

  async function handleExtract() {
    setExtracting(true)
    setProgress(0)
    try {
      const res = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interval }),
      })
      if (res.ok) {
        const data = await res.json()
        setFrames(data || [])
        setSelected(new Set())
      }
    } catch (err) {
      console.error('Extract failed:', err)
    } finally {
      setProgress(100)
      setExtracting(false)
    }
  }

  async function handleExport() {
    try {
      const res = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ids: [...selected],
          outputDir: exportDir,
          format: exportFormat,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        alert(`Exported ${data.count} frame(s) to:\n${exportDir}`)
      } else {
        const msg = await res.text()
        alert(`Export failed:\n${msg}`)
      }
    } catch (err) {
      alert(`Export failed: ${err.message}`)
    }
  }

  // Still checking status
  if (videoLoaded === null) return null

  // No video loaded — show upload screen
  if (!videoLoaded) {
    return <UploadView onVideoLoaded={handleVideoLoaded} />
  }

  return (
    <div className="min-h-screen bg-[#131313] text-[#e5e2e1]">
      <TopBar
        videoName={videoName}
        interval={interval}
        onIntervalChange={setInterval}
        onExtract={handleExtract}
        extracting={extracting}
        progress={progress}
      />
      <FrameGrid frames={frames} selected={selected} onToggle={handleToggle} />
      <BottomBar
        frames={frames}
        selected={selected}
        onSelectAll={handleSelectAll}
        onDeselectAll={handleDeselectAll}
        onExport={handleExport}
        extracting={extracting}
        progress={progress}
        exportDir={exportDir}
        onExportDirChange={setExportDir}
        exportFormat={exportFormat}
        onExportFormatChange={setExportFormat}
      />
    </div>
  )
}
