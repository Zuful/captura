export default function BottomBar({ frames, selected, onSelectAll, onDeselectAll, onExport, extracting, progress }) {
  const count = selected.size

  return (
    <footer className="fixed bottom-0 w-full z-50 flex justify-around items-center px-8 h-20 bg-[#131313]/90 backdrop-blur-xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)] border-t border-[#2a2a2a]">
      {/* Total frames */}
      <div className="flex flex-col items-center justify-center text-neutral-500">
        <span className="material-symbols-outlined text-[20px] mb-1">movie_filter</span>
        <span className="text-[12px] font-bold tracking-widest uppercase">{frames.length.toLocaleString()} Frames</span>
      </div>

      {/* Progress + select controls */}
      <div className="flex flex-col items-center justify-center gap-2 w-1/3">
        {extracting ? (
          <>
            <div className="flex justify-between w-full px-2">
              <span className="text-[10px] font-bold text-neutral-500 tracking-widest uppercase">Analysis Progress</span>
              <span className="text-[10px] font-bold text-[#bac3ff] tracking-widest uppercase">{progress}%</span>
            </div>
            <div className="w-full h-1 bg-[#2a2a2a] rounded-full overflow-hidden">
              <div className="h-full bg-[#bac3ff] transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
          </>
        ) : (
          <div className="flex items-center gap-4">
            <button
              onClick={onSelectAll}
              className="text-[10px] font-bold tracking-widest uppercase text-[#bac3ff] hover:text-white transition-colors active:scale-95"
            >
              Select All
            </button>
            <span className="text-[#454652]">·</span>
            <button
              onClick={onDeselectAll}
              className="text-[10px] font-bold tracking-widest uppercase text-neutral-500 hover:text-white transition-colors active:scale-95"
            >
              Deselect All
            </button>
          </div>
        )}
      </div>

      {/* Export button */}
      <button
        onClick={onExport}
        disabled={count === 0}
        className={`flex flex-col items-center justify-center transition-all active:scale-95 duration-200 ${
          count > 0 ? 'text-[#bac3ff] hover:text-white' : 'text-neutral-600 cursor-not-allowed'
        }`}
      >
        <span className="material-symbols-outlined text-[20px] mb-1">download</span>
        <span className="text-[12px] font-bold tracking-widest uppercase">
          {count > 0 ? `Export ${count}` : '0 Selected'}
        </span>
      </button>
    </footer>
  )
}
