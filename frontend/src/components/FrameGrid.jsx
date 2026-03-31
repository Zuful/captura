import FrameCard from './FrameCard'

export default function FrameGrid({ frames, selected, onToggle }) {
  if (frames.length === 0) {
    return (
      <main className="pt-24 pb-32 px-8 min-h-screen flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <div className="p-12 border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center bg-[#0e0e0e]/50">
            <span className="material-symbols-outlined text-[48px] text-neutral-600 mb-4">movie_edit</span>
            <p className="text-neutral-500 text-[14px] font-medium mb-1">Click <span className="text-[#bac3ff] font-bold">Extract</span> to start frame analysis</p>
            <p className="text-neutral-700 text-[11px] uppercase tracking-[0.2em]">MP4, MOV, RAW, MKV Supported</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="pt-24 pb-32 px-8 min-h-screen custom-scrollbar">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-[#c5c5d4] font-bold tracking-widest uppercase text-[10px] mb-1">Extraction Workspace</h2>
          <div className="text-[32px] font-bold text-white tracking-tighter">Frame Browser</div>
        </div>
        <span className="text-[10px] font-bold tracking-widest uppercase text-neutral-600">{frames.length} frames</span>
      </div>

      <div className="frame-grid">
        {frames.map((frame) => (
          <FrameCard
            key={frame.id}
            frame={frame}
            selected={selected}
            onToggle={onToggle}
          />
        ))}
      </div>

      <div className="mt-12 p-12 border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center bg-[#0e0e0e]/50">
        <span className="material-symbols-outlined text-[48px] text-neutral-600 mb-4">movie_edit</span>
        <p className="text-neutral-500 text-[14px] font-medium mb-1">Drop additional video files here to append</p>
        <p className="text-neutral-700 text-[11px] uppercase tracking-[0.2em]">MP4, MOV, RAW, MKV Supported</p>
      </div>
    </main>
  )
}
