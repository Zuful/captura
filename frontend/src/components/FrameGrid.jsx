import FrameCard from './FrameCard'

export default function FrameGrid({ frames, selected, onToggle }) {
  if (frames.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        <p>No frames yet. Click <span className="text-indigo-400 font-medium">Extract</span> to start.</p>
      </div>
    )
  }

  return (
    <div className="flex-1 p-4 overflow-y-auto">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {frames.map((frame) => (
          <FrameCard
            key={frame.id}
            frame={frame}
            selected={selected}
            onToggle={onToggle}
          />
        ))}
      </div>
    </div>
  )
}
