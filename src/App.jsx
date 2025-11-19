import { useEffect, useMemo, useRef, useState } from 'react'
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js'
import AudioPlayer from './components/AudioPlayer'
import MusicSelector from './components/MusicSelector'

const VOICE_ID = 'skDYzXO115YQQ50enF2w'
const MODEL_ID = 'eleven_multilingual_v2'
const OUTPUT_FORMAT = 'mp3_44100_128'

function App() {
  const [script, setScript] = useState('')
  const [selectedMusic, setSelectedMusic] = useState('soft-instrumental')
  const [backgroundVolume, setBackgroundVolume] = useState(0.5)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [audioUrl, setAudioUrl] = useState(null)
  const [audioBlob, setAudioBlob] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const audioRef = useRef(null)
  const objectUrlRef = useRef(null)
  const hasAudio = Boolean(audioUrl)
  const isDownloadDisabled = !audioBlob || isGenerating
  const regenerateDisabled = isGenerating || !hasAudio
  const regenerateLabel = isGenerating && hasAudio ? 'Regenerating...' : 'Regenerate'
  const elevenLabsClient = useMemo(() => {
    const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY
    if (!apiKey) return null
    return new ElevenLabsClient({ apiKey })
  }, [])

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current)
      }
    }
  }, [])

  useEffect(() => {
    const audioEl = audioRef.current
    if (!audioEl) return

    const handleLoadedMetadata = () => {
      setDuration(Number.isFinite(audioEl.duration) ? audioEl.duration : 0)
    }

    const handleTimeUpdate = () => {
      setCurrentTime(audioEl.currentTime)
    }

    const handleEnded = () => {
      setIsPlaying(false)
    }

    audioEl.addEventListener('loadedmetadata', handleLoadedMetadata)
    audioEl.addEventListener('timeupdate', handleTimeUpdate)
    audioEl.addEventListener('ended', handleEnded)

    return () => {
      audioEl.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audioEl.removeEventListener('timeupdate', handleTimeUpdate)
      audioEl.removeEventListener('ended', handleEnded)
    }
  }, [])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.load()
    }
  }, [audioUrl])

  const generateAudio = async () => {
    if (!script.trim()) {
      setErrorMessage('Please provide a script before generating audio.')
      return
    }

    if (!elevenLabsClient) {
      setErrorMessage('Missing ElevenLabs API key. Set VITE_ELEVENLABS_API_KEY and reload the app.')
      return
    }

    setIsGenerating(true)
    setErrorMessage('')
    setIsPlaying(false)

    try {
      const audioStream = await elevenLabsClient.textToSpeech.convert(VOICE_ID, {
        text: script,
        modelId: MODEL_ID,
        outputFormat: OUTPUT_FORMAT,
        voiceSettings: {
          speed: 0.90,
          stability: 0.5,
          similarityBoost: 0.75,
        }
      })

      const response = new Response(audioStream)
      const blob = await response.blob()
      const nextUrl = URL.createObjectURL(blob)

      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current)
      }

      objectUrlRef.current = nextUrl
      setAudioBlob(blob)
      setAudioUrl(nextUrl)
      setCurrentTime(0)
      setDuration(0)
    } catch (error) {
      console.error(error)
      setErrorMessage(error?.message ?? 'Unable to generate audio. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const togglePlayback = async () => {
    if (!audioRef.current || !hasAudio) {
      return
    }

    try {
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
      } else {
        await audioRef.current.play()
        setIsPlaying(true)
      }
    } catch (error) {
      console.error(error)
      setErrorMessage('Unable to play the generated audio in this browser.')
    }
  }

  const handleSeek = (time) => {
    if (!audioRef.current) return
    audioRef.current.currentTime = time
    setCurrentTime(time)
  }

  const handleGenerate = () => {
    generateAudio()
  }

  const handleDownload = () => {
    if (!audioBlob) {
      setErrorMessage('Generate audio before attempting to download.')
      return
    }

    const downloadUrl = URL.createObjectURL(audioBlob)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = `yoga-voice-${Date.now()}.mp3`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(downloadUrl)
  }

  const handleRegenerate = () => {
    generateAudio()
  }

  return (
    <div className="min-h-screen bg-[#FAFAF9] px-4 py-8 md:px-8 lg:px-16">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl md:text-6xl font-bold text-yoga-purple-dark mb-3">
            Yoga Voice
          </h1>
          <p className="text-lg text-yoga-gray-dark">
            Generate soothing guided meditations with your own script.
          </p>
        </div>

        {/* Script Input */}
        <div className="mb-8">
          <textarea
            value={script}
            onChange={(e) => setScript(e.target.value)}
            placeholder="Write your yoga narration or meditation script here..."
            className="w-full h-48 p-4 rounded-2xl bg-yoga-purple-light border-0 resize-none focus:outline-none focus:ring-2 focus:ring-yoga-purple-DEFAULT text-yoga-gray-dark placeholder-yoga-gray-DEFAULT"
          />
        </div>

        {/* Generate Button */}
        <div className="mb-10">
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className={`w-full py-4 rounded-2xl text-white font-semibold text-lg transition-colors duration-200 shadow-md hover:shadow-lg ${
              isGenerating ? 'bg-yoga-gray-light cursor-not-allowed' : 'bg-yoga-purple-DEFAULT hover:bg-yoga-purple-dark'
            }`}
          >
            {isGenerating ? 'Generating...' : 'Generate Audio'}
          </button>
        </div>

        {/* Music Selection */}
        <div className="mb-10">
          <h2 className="text-lg font-semibold text-yoga-gray-dark mb-4">
            Blend with background music
          </h2>
          <MusicSelector
            selectedMusic={selectedMusic}
            onSelect={setSelectedMusic}
            volume={backgroundVolume}
          />
          <div className="mt-6">
            <div className="flex items-center justify-between text-sm text-yoga-gray-dark mb-2">
              <span>Background volume</span>
              <span>{Math.round(backgroundVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={backgroundVolume}
              onChange={(e) => setBackgroundVolume(Number(e.target.value))}
              className="w-full accent-yoga-purple-DEFAULT"
            />
            <p className="text-xs text-yoga-gray-DEFAULT mt-2">
              Adjust how prominent the ambient track sounds during playback.
            </p>
          </div>
        </div>

        {/* Error Banner */}
        {errorMessage && (
          <div className="mb-6 rounded-xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
            {errorMessage}
          </div>
        )}

        {/* Audio Player */}
        <div className="mb-8">
          <AudioPlayer
            isPlaying={isPlaying}
            onPlayPause={togglePlayback}
            currentTime={currentTime}
            duration={duration}
            onTimeUpdate={handleSeek}
            disabled={!hasAudio || isGenerating}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <button
            onClick={handleDownload}
            disabled={isDownloadDisabled}
            className={`flex-1 py-3 px-6 rounded-xl border-2 font-medium transition-colors duration-200 flex items-center justify-center gap-2 ${
              isDownloadDisabled
                ? 'bg-yoga-gray-light/40 border-yoga-gray-light text-yoga-gray-dark/60 cursor-not-allowed'
                : 'bg-white border-yoga-gray-light text-yoga-gray-dark hover:bg-yoga-gray-light'
            }`}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Download audio
          </button>
          <button
            onClick={handleRegenerate}
            disabled={regenerateDisabled}
            className={`flex-1 py-3 px-6 rounded-xl border-2 font-medium transition-colors duration-200 flex items-center justify-center gap-2 ${
              regenerateDisabled
                ? 'bg-yoga-gray-light/40 border-yoga-gray-light text-yoga-gray-dark/60 cursor-not-allowed'
                : 'bg-white border-yoga-gray-light text-yoga-gray-dark hover:bg-yoga-gray-light'
            }`}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            {regenerateLabel}
          </button>
        </div>

        {/* Footer */}
        <div className="text-center text-yoga-gray-DEFAULT text-sm flex items-center justify-center gap-2">
          <span>Crafted for mindful creators</span>
          <svg
            className="w-4 h-4 text-pink-300"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <audio ref={audioRef} src={audioUrl ?? undefined} preload="metadata" hidden />
      </div>
    </div>
  )
}

export default App

