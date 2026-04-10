export default function TopBar({ videoName, interval, onIntervalChange, onExtract, extracting, progress, onNewSession }) {
  return (
    <header className="fixed top-0 w-full z-50 flex justify-between items-center px-6 h-16 bg-[#131313]/90 backdrop-blur-xl shadow-2xl">
      <div className="flex items-center gap-8">
        <h1 className="text-xl font-black text-white tracking-tighter uppercase">Captura</h1>
        {videoName && (
          <span className="text-[#bac3ff] font-bold tracking-tight text-sm uppercase px-1 truncate max-w-xs">
            {videoName}
          </span>
        )}
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={onNewSession}
          disabled={extracting}
          title="Clear session and load a new video"
          className="text-[#c5c5d4] hover:text-white text-[11px] font-bold tracking-widest uppercase flex items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity disabled:cursor-not-allowed"
        >
          <span className="material-symbols-outlined text-[15px]">restart_alt</span>
          New Session
        </button>

        <div className="flex items-center gap-2">
          <label className="text-[10px] font-bold tracking-widest uppercase text-[#c5c5d4]">Interval</label>
          <select
            value={interval}
            onChange={(e) => onIntervalChange(Number(e.target.value))}
            className="bg-[#1c1b1b] text-[#e5e2e1] text-xs border border-[#454652] rounded px-2 py-1.5 outline-none"
          >
            <option value={1}>1s</option>
            <option value={2}>2s</option>
            <option value={5}>5s</option>
            <option value={10}>10s</option>
          </select>
        </div>

        <button
          onClick={onExtract}
          disabled={extracting}
          className="bg-gradient-to-br from-[#bac3ff] to-[#4453a7] text-[#15267b] font-bold tracking-widest uppercase text-[12px] px-6 py-2.5 rounded-full active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[16px]">movie_filter</span>
          {extracting ? 'Extracting…' : 'Extract'}
        </button>
      </div>

      {/* Progress indicator integrated at bottom edge */}
      <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#2a2a2a]">
        {extracting && (
          <div
            className="h-full bg-[#bac3ff] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        )}
      </div>
    </header>
  )
}
