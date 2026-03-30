export default function TopBar({ videoName, interval, onIntervalChange, onExtract }) {
  return (
    <nav className="bg-gray-900 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="font-bold text-white text-lg">Captura</span>
        {videoName && (
          <span className="text-gray-400 text-sm truncate max-w-xs">{videoName}</span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <label className="text-gray-400 text-sm">Interval:</label>
        <select
          value={interval}
          onChange={(e) => onIntervalChange(Number(e.target.value))}
          className="bg-gray-800 text-white text-sm border border-gray-700 rounded px-2 py-1"
        >
          <option value={1}>1s</option>
          <option value={2}>2s</option>
          <option value={5}>5s</option>
          <option value={10}>10s</option>
        </select>
      </div>

      <button
        onClick={onExtract}
        className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded transition-colors"
      >
        Extract
      </button>
    </nav>
  )
}
