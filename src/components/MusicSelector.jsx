import { useEffect, useRef } from 'react'
import oceanWavesAudio from '../background-noise/ocean-waves.mp3'
import forestAudio from '../background-noise/forest.mp3'
import campfireAudio from '../background-noise/campfire.mp3'
import ambientWaveAudio from '../background-noise/ambient-wave.mp3'

export const musicOptions = [
  {
    id: 'ocean-waves',
    name: 'Ocean Waves',
    bgColor: 'bg-gradient-to-br from-cyan-300 via-blue-400 to-teal-500',
    audioFile: oceanWavesAudio,
    icon: (
      <div className="relative w-full h-full flex items-center justify-center">
        <svg className="w-12 h-12 text-white opacity-90" fill="currentColor" viewBox="0 0 24 24">
          <path d="M2 12c0 5.523 4.477 10 10 10s10-4.477 10-10S17.523 2 12 2 2 6.477 2 12zm2 0a8 8 0 1016 0 8 8 0 00-16 0zm3-2a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1H8a1 1 0 01-1-1v-4zm5-1a1 1 0 00-1 1v4a1 1 0 001 1h2a1 1 0 001-1v-4a1 1 0 00-1-1h-2z" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
          </svg>
        </div>
      </div>
    ),
  },
  {
    id: 'forest-ambience',
    name: 'Forest Ambience',
    bgColor: 'bg-gradient-to-br from-green-300 via-emerald-400 to-green-600',
    audioFile: forestAudio,
    icon: (
      <div className="relative w-full h-full flex items-center justify-center">
        <svg className="w-12 h-12 text-white opacity-90" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2L4 8v14h16V8l-8-6zm0 2.5l6 4.5v11H6V9l6-4.5z" />
          <path d="M10 8h4v6h-4V8zm2-2v2" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
          </svg>
        </div>
      </div>
    ),
  },
  {
    id: 'campfire-crackle',
    name: 'Campfire Crackle',
    bgColor: 'bg-gradient-to-br from-orange-300 via-red-400 to-orange-600',
    audioFile: campfireAudio,
    icon: (
      <div className="relative w-full h-full flex items-center justify-center">
        <svg className="w-12 h-12 text-white opacity-90" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 20c-2.5 0-4.5-2-4.5-4.5 0-1.5.8-2.8 2-3.5V10c0-2.2 1.8-4 4-4s4 1.8 4 4v2c1.2.7 2 2 2 3.5 0 2.5-2 4.5-4.5 4.5zm0-12c-1.1 0-2 .9-2 2v1.5c.3-.1.6-.1 1-.1s.7 0 1 .1V10c0-1.1-.9-2-2-2z" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
          </svg>
        </div>
      </div>
    ),
  },
  {
    id: 'soft-instrumental',
    name: 'Soft Instrumental',
    bgColor: 'bg-gradient-to-br from-yellow-200 to-yellow-400',
    audioFile: ambientWaveAudio,
    icon: (
      <div className="flex items-end justify-center gap-1.5 h-10">
        <div className="w-1.5 bg-white rounded-full h-4 opacity-90"></div>
        <div className="w-1.5 bg-white rounded-full h-6 opacity-90"></div>
        <div className="w-1.5 bg-white rounded-full h-8 opacity-90"></div>
        <div className="w-1.5 bg-white rounded-full h-5 opacity-90"></div>
        <div className="w-1.5 bg-white rounded-full h-7 opacity-90"></div>
      </div>
    ),
  },
  {
    id: 'no-music',
    name: 'No Music',
    bgColor: 'bg-stone-100',
    audioFile: null,
    icon: (
      <div className="relative w-full h-full flex items-center justify-center">
        <div className="w-12 h-12 rounded-full bg-yoga-gray-light flex items-center justify-center">
          <svg className="w-8 h-8 text-yoga-gray-DEFAULT" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>
    ),
  },
]

function MusicSelector({ selectedMusic, onSelect, volume = 0.5 }) {
  const audioRef = useRef(null)

  useEffect(() => {
    // Stop any currently playing audio
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }

    // Find the selected music option
    const selectedOption = musicOptions.find((option) => option.id === selectedMusic)

    // If a valid music option is selected and it has an audio file, play it
    if (selectedOption && selectedOption.audioFile) {
      // Create a new audio element
      const audio = new Audio(selectedOption.audioFile)
      audio.loop = true
      audio.volume = volume // Set volume based on provided value
      
      // Play the audio
      audio.play().catch((error) => {
        console.error('Error playing audio:', error)
      })

      // Store reference to the audio element
      audioRef.current = audio

      // Cleanup function to stop audio when component unmounts or selection changes
      return () => {
        audio.pause()
        audio.currentTime = 0
      }
    }
  }, [selectedMusic])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
    }
  }, [volume])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
      }
    }
  }, [])

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
      {musicOptions.map((option) => (
        <button
          key={option.id}
          onClick={() => onSelect(option.id)}
          className={`relative aspect-square rounded-2xl ${option.bgColor} flex items-center justify-center transition-all duration-200 ${
            selectedMusic === option.id
              ? 'ring-4 ring-yoga-purple-DEFAULT ring-offset-2'
              : 'hover:scale-105 hover:shadow-lg'
          }`}
        >
          {option.icon}
        </button>
      ))}
    </div>
  )
}

export default MusicSelector

