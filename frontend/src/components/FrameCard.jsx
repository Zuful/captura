function formatTimestamp(seconds) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  const f = Math.round((seconds % 1) * 24)
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}:${String(f).padStart(2,'0')}`
}

export default function FrameCard({ frame, selected, onToggle }) {
  const isSelected = selected.has(frame.id)

  return (
    <div
      onClick={() => onToggle(frame.id)}
      className="group relative flex flex-col gap-3 cursor-pointer"
    >
      <div
        className={`aspect-video bg-[#1c1b1b] rounded-lg overflow-hidden relative transition-all active:scale-95 duration-200 ${
          isSelected
            ? 'border-2 border-[#3F51B5] shadow-2xl'
            : 'border border-transparent hover:border-white/20'
        }`}
      >
        <img
          src={`/api/frames/${frame.id}`}
          alt={`Frame at ${frame.timestamp}s`}
          className={`w-full h-full object-cover transition-opacity ${isSelected ? 'opacity-90' : 'opacity-60 group-hover:opacity-100'}`}
        />

        {/* Selection indicator top-right */}
        <div className={`absolute top-3 right-3 transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
          {isSelected ? (
            <div className="bg-[#3F51B5] text-white rounded-full p-1 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]" style={{fontVariationSettings: "'FILL' 1"}}>check_circle</span>
            </div>
          ) : (
            <div className="bg-white/10 backdrop-blur-md text-white rounded-full p-1 border border-white/20">
              <span className="material-symbols-outlined text-[18px]">radio_button_unchecked</span>
            </div>
          )}
        </div>

        {/* Sharpness badge bottom-left */}
        {frame.sharpness != null && (
          <div className="absolute bottom-3 left-3 bg-[#353534]/80 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest text-[#bac3ff] border border-white/10">
            {frame.sharpness.toFixed(1)} SHARP
          </div>
        )}
      </div>

      <div className="flex justify-between items-center px-1">
        <span className="font-mono text-[12px] text-[#c5c5d4] tracking-wider">{formatTimestamp(frame.timestamp)}</span>
        <span className="text-[10px] text-neutral-500 uppercase font-bold tracking-widest">Frame {frame.id}</span>
      </div>
    </div>
  )
}
