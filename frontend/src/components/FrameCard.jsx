function SharpnessBadge({ sharpness }) {
  let colorClass = 'bg-red-600 text-white'
  if (sharpness >= 70) colorClass = 'bg-green-600 text-white'
  else if (sharpness >= 40) colorClass = 'bg-yellow-500 text-black'

  return (
    <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${colorClass}`}>
      {sharpness.toFixed(0)}
    </span>
  )
}

export default function FrameCard({ frame, selected, onToggle }) {
  const isSelected = selected.has(frame.id)

  return (
    <div
      onClick={() => onToggle(frame.id)}
      className={`bg-gray-800 rounded-lg overflow-hidden cursor-pointer transition-all ${
        isSelected ? 'ring-2 ring-indigo-500' : 'ring-1 ring-gray-700'
      }`}
    >
      <div className="relative">
        {/* 16:9 aspect ratio container */}
        <div className="aspect-video relative">
          <img
            src={`/api/frames/${frame.id}`}
            alt={`Frame at ${frame.timestamp}s`}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Checkbox overlay top-right */}
        <div className="absolute top-2 right-2">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggle(frame.id)}
            onClick={(e) => e.stopPropagation()}
            className="w-4 h-4 accent-indigo-500 cursor-pointer"
          />
        </div>
      </div>

      {/* Bottom info strip */}
      <div className="flex items-center justify-between px-2 py-1.5">
        <span className="text-gray-400 text-xs">{frame.timestamp.toFixed(1)}s</span>
        <SharpnessBadge sharpness={frame.sharpness} />
      </div>
    </div>
  )
}
