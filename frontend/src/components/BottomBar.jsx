const FORMAT_OPTIONS = [
  { value: 'landscape', label: '16:9', icon: 'crop_16_9' },
  { value: 'portrait',  label: '2:3',  icon: 'crop_portrait' },
  { value: 'both',      label: 'Both', icon: 'layers' },
]

export default function BottomBar({ frames, selected, onSelectAll, onDeselectAll, onExport, extracting, progress, exportDir, onExportDirChange, exportFormat, onExportFormatChange }) {
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

      {/* Format toggle + export path + button */}
      <div className="flex flex-col items-end gap-1.5">
        <div className="flex items-center gap-2">
          {/* Format toggle */}
          <div className="flex items-center bg-[#1c1b1b] border border-[#454652] rounded overflow-hidden">
            {FORMAT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => onExportFormatChange(opt.value)}
                title={opt.value === 'landscape' ? 'Full frame (16:9)' : opt.value === 'portrait' ? 'Portrait crop (2:3)' : 'Both variants'}
                className={`flex items-center gap-1 px-2 py-1 text-[10px] font-bold tracking-widest uppercase transition-colors ${
                  exportFormat === opt.value
                    ? 'bg-[#bac3ff]/15 text-[#bac3ff]'
                    : 'text-neutral-500 hover:text-neutral-300'
                }`}
              >
                <span className="material-symbols-outlined text-[13px]">{opt.icon}</span>
                {opt.label}
              </button>
            ))}
          </div>

          {/* Export path */}
          <div className="flex items-center gap-1.5 bg-[#1c1b1b] border border-[#454652] rounded px-2 py-1 focus-within:border-[#bac3ff]/50 transition-colors">
            <span className="material-symbols-outlined text-[14px] text-neutral-600">folder</span>
            <input
              type="text"
              value={exportDir}
              onChange={(e) => onExportDirChange(e.target.value)}
              className="bg-transparent text-[11px] font-mono text-[#c5c5d4] outline-none w-48 placeholder:text-neutral-700"
              placeholder="~/Desktop/captura-export"
              spellCheck={false}
            />
          </div>
        </div>

        <button
          onClick={onExport}
          disabled={count === 0}
          className={`flex items-center gap-2 transition-all active:scale-95 duration-200 ${
            count > 0 ? 'text-[#bac3ff] hover:text-white' : 'text-neutral-600 cursor-not-allowed'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">download</span>
          <span className="text-[11px] font-bold tracking-widest uppercase">
            {count > 0 ? `Export ${count}` : '0 Selected'}
          </span>
        </button>
      </div>
    </footer>
  )
}
