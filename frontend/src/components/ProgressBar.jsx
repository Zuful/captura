export default function ProgressBar({ progress }) {
  return (
    <div className="px-4 py-2 bg-gray-800">
      <div className="flex items-center gap-3">
        <div className="flex-1 bg-gray-700 rounded-full h-2 overflow-hidden">
          <div
            className="bg-indigo-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-gray-300 text-sm w-10 text-right">{progress}%</span>
      </div>
    </div>
  )
}
