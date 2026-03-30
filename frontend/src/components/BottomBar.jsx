export default function BottomBar({ frames, selected, onSelectAll, onDeselectAll, onExport }) {
  const count = selected.size

  return (
    <div className="fixed bottom-0 inset-x-0 bg-gray-900 border-t border-gray-700 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="text-gray-300 text-sm">{count} frame{count !== 1 ? 's' : ''} selected</span>
        <button
          onClick={onSelectAll}
          className="text-indigo-400 hover:text-indigo-300 text-sm transition-colors"
        >
          Select All
        </button>
        <span className="text-gray-600">/</span>
        <button
          onClick={onDeselectAll}
          className="text-indigo-400 hover:text-indigo-300 text-sm transition-colors"
        >
          Deselect All
        </button>
      </div>

      <button
        onClick={onExport}
        disabled={count === 0}
        className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2 rounded transition-colors"
      >
        Export Selected
      </button>
    </div>
  )
}
