function formatTime(seconds) {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

function AudioPlayer({
  isPlaying,
  onPlayPause,
  currentTime,
  duration,
  onTimeUpdate,
  disabled = false,
}) {
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  const handleProgressClick = (e) => {
    if (disabled || duration === 0) return

    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentage = x / rect.width
    const newTime = percentage * duration
    onTimeUpdate(newTime)
  }

  return (
    <div className="flex flex-col items-center">
      {/* Play/Pause Button */}
      <button
        onClick={onPlayPause}
        disabled={disabled}
        className={`w-20 h-20 rounded-full text-white flex items-center justify-center transition-colors duration-200 shadow-lg mb-6 ${
          disabled
            ? 'bg-yoga-gray-light cursor-not-allowed opacity-60'
            : 'bg-yoga-purple-DEFAULT hover:bg-yoga-purple-dark'
        }`}
      >
        {isPlaying ? (
          <svg
            className="w-10 h-10"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M6 4h2v12H6V4zm6 0h2v12h-2V4z" />
          </svg>
        ) : (
          <svg
            className="w-10 h-10 ml-1"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
          </svg>
        )}
      </button>

      {/* Progress Bar */}
      <div
        className={`w-full h-2 rounded-full mb-2 ${
          disabled ? 'bg-yoga-gray-light/70 cursor-not-allowed' : 'bg-yoga-gray-light cursor-pointer'
        }`}
        onClick={handleProgressClick}
      >
        <div
          className="h-full bg-yoga-blue-DEFAULT rounded-full transition-all duration-200"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Time Display */}
      <div className="text-sm text-yoga-gray-dark">
        <span>{formatTime(currentTime)}</span>
        <span className="mx-1">/</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  )
}

export default AudioPlayer

