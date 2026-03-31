import { useState, useRef } from 'react'

const ACCEPTED = ['video/mp4', 'video/quicktime', 'video/x-matroska', 'video/x-msvideo', 'video/webm']

export default function UploadView({ onVideoLoaded }) {
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const inputRef = useRef(null)

  async function upload(file) {
    if (!file) return
    setError(null)
    setUploading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch('/api/video', { method: 'POST', body: form })
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      onVideoLoaded(data.videoName)
    } catch (err) {
      setError(err.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  function onDrop(e) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) upload(file)
  }

  return (
    <div className="min-h-screen bg-[#131313] flex flex-col items-center justify-center px-8">
      {/* Header */}
      <div className="mb-12 text-center">
        <h1 className="text-3xl font-black text-white tracking-tighter uppercase mb-2">Captura</h1>
        <p className="text-[10px] font-bold tracking-widest uppercase text-[#c5c5d4]">Digital Darkroom</p>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => !uploading && inputRef.current?.click()}
        className={`w-full max-w-xl p-16 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center gap-4 cursor-pointer transition-all duration-200 ${
          dragging
            ? 'border-[#bac3ff] bg-[#bac3ff]/5'
            : 'border-white/10 bg-[#0e0e0e]/50 hover:border-white/20 hover:bg-[#0e0e0e]/80'
        }`}
      >
        {uploading ? (
          <>
            <span className="material-symbols-outlined text-[48px] text-[#bac3ff] animate-pulse">upload_file</span>
            <p className="text-[#c5c5d4] text-[14px] font-medium">Uploading…</p>
          </>
        ) : (
          <>
            <span className="material-symbols-outlined text-[48px] text-neutral-600">movie_edit</span>
            <div className="text-center">
              <p className="text-[#e5e2e1] text-[14px] font-medium mb-1">
                Drop a video file here
              </p>
              <p className="text-neutral-500 text-[12px]">or click to browse</p>
            </div>
            <p className="text-neutral-700 text-[11px] uppercase tracking-[0.2em]">MP4 · MOV · MKV · AVI · WEBM</p>
          </>
        )}
      </div>

      {error && (
        <p className="mt-4 text-[#ffb4ab] text-[12px] font-medium">{error}</p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(',')}
        className="hidden"
        onChange={(e) => upload(e.target.files[0])}
      />
    </div>
  )
}
