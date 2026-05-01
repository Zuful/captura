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
  // Incremented on each extraction to bust the browser cache for frame images.
  // Without this, /api/frames/frame_0001 from session 1 would be served from
  // cache in session 2 (same URL, different content).
  const [extractionKey, setExtractionKey] = useState(0)
  const [toast, setToast] = useState(null) // {msg, error?}

  useEffect(() => {
    const isNewTab = !sessionStorage.getItem('captura-session')
    const init = isNewTab
      ? fetch('/api/reset', { method: 'POST' }).then(() => fetch('/api/status'))
      : fetch('/api/status')

    init
      .then((r) => r.json())
      .then((data) => {
        sessionStorage.setItem('captura-session', '1')
        setVideoLoaded(data.videoLoaded ?? false)
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
        setExtractionKey((k) => k + 1)
      }
    } catch (err) {
      console.error('Extract failed:', err)
    } finally {
      setProgress(100)
      setExtracting(false)
    }
  }

  async function handleNewSession() {
    try {
      await fetch('/api/reset', { method: 'POST' })
    } catch (err) {
      console.error('Reset failed:', err)
    }
    setVideoLoaded(false)
    setVideoName('')
    setFrames([])
    setSelected(new Set())
  }

  function showToast(msg, error = false) {
    setToast({ msg, error })
    setTimeout(() => setToast(null), 4000)
  }

  async function handleCleanup() {
    try {
      const res = await fetch('/api/cleanup', { method: 'POST' })
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      if (data.deleted === 0) {
        showToast('No orphaned cache to clean up.')
      } else {
        const mb = (data.freedBytes / 1024 / 1024).toFixed(1)
        showToast(`${data.deleted} orphaned session${data.deleted > 1 ? 's' : ''} deleted — ${mb} MB freed.`)
      }
    } catch (err) {
      showToast(`Cleanup failed: ${err.message}`, true)
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
        onNewSession={handleNewSession}
        onCleanup={handleCleanup}
      />
      {toast && (
        <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl text-[12px] font-bold tracking-wide shadow-2xl backdrop-blur-md border transition-all ${
          toast.error
            ? 'bg-[#ffb4ab]/10 border-[#ffb4ab]/30 text-[#ffb4ab]'
            : 'bg-[#bac3ff]/10 border-[#bac3ff]/30 text-[#bac3ff]'
        }`}>
          {toast.msg}
        </div>
      )}
      <FrameGrid frames={frames} selected={selected} onToggle={handleToggle} extractionKey={extractionKey} />
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
