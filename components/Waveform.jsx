'use client'

// 20 vertical bars with staggered animation classes for organic waveform feel
const BAR_CLASSES = [
  'bar1', 'bar2', 'bar3', 'bar4', 'bar5',
  'bar3', 'bar2', 'bar4', 'bar1', 'bar5',
  'bar2', 'bar3', 'bar4', 'bar1', 'bar5',
  'bar2', 'bar3', 'bar1', 'bar4', 'bar2',
]

export default function Waveform({ isRecording }) {
  return (
    <div className="flex items-center justify-center gap-[3px] h-10 px-2">
      {BAR_CLASSES.map((cls, i) => (
        <div
          key={i}
          className={`w-[3px] rounded-full transition-all duration-300 ${
            isRecording
              ? `${cls} bg-gold-400`
              : 'bg-white/10'
          }`}
          style={isRecording ? {} : { height: `${4 + (i % 5) * 3}px` }}
        />
      ))}
    </div>
  )
}
