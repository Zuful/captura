import { useState, useEffect } from 'react'
import TopBar from './components/TopBar'
import ProgressBar from './components/ProgressBar'
import FrameGrid from './components/FrameGrid'
import BottomBar from './components/BottomBar'

export default function App() {
  const [frames, setFrames] = useState([])
  const [selected, setSelected] = useState(new Set())
  const [extracting, setExtracting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [videoName, setVideoName] = useState('')
  const [interval, setInterval] = useState(2)

  useEffect(() => {
    fetch('/api/frames')
      .then((r) => r.json())
      .then((data) => setFrames(data || []))
      .catch(() => {})
  }, [])

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
          outputDir: '~/Desktop/captura-export',
        }),
      })
      if (res.ok) {
        const data = await res.json()
        alert(`Exported ${data.count} frame(s) successfully.`)
      }
    } catch (err) {
      console.error('Export failed:', err)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col pb-16">
      <TopBar
        videoName={videoName}
        interval={interval}
        onIntervalChange={setInterval}
        onExtract={handleExtract}
      />
      {extracting && <ProgressBar progress={progress} />}
      <FrameGrid frames={frames} selected={selected} onToggle={handleToggle} />
      <BottomBar
        frames={frames}
        selected={selected}
        onSelectAll={handleSelectAll}
        onDeselectAll={handleDeselectAll}
        onExport={handleExport}
      />
    </div>
  )
}
