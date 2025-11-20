import { useEffect, useMemo, useRef, useState } from 'react'
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js'
import AudioPlayer from './components/AudioPlayer'
import MusicSelector, { musicOptions } from './components/MusicSelector'

const VOICE_ID = 'skDYzXO115YQQ50enF2w'
const MODEL_ID = 'eleven_multilingual_v2'
const OUTPUT_FORMAT = 'mp3_44100_128'
const APP_PASSWORD = import.meta.env.VITE_APP_PASSWORD

function App() {
  const [script, setScript] = useState('')
  const [selectedMusic, setSelectedMusic] = useState('soft-instrumental')
  const [backgroundVolume, setBackgroundVolume] = useState(0.5)
  const [speed, setSpeed] = useState(0.75)
  const [stability, setStability] = useState(0.5)
  const [similarityBoost, setSimilarityBoost] = useState(0.75)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [audioUrl, setAudioUrl] = useState(null)
  const [audioBlob, setAudioBlob] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [passwordInput, setPasswordInput] = useState('')
  const [authError, setAuthError] = useState('')
  const [authChecked, setAuthChecked] = useState(false)
  const audioRef = useRef(null)
  const objectUrlRef = useRef(null)
  const hasAudio = Boolean(audioUrl)
  const isDownloadDisabled = !audioBlob || isGenerating || isDownloading
  const regenerateDisabled = isGenerating || !hasAudio
  const regenerateLabel = isGenerating && hasAudio ? 'Regenerating...' : 'Regenerate'
  const elevenLabsClient = useMemo(() => {
    const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY
    if (!apiKey) return null
    return new ElevenLabsClient({ apiKey })
  }, [])
  const backgroundAudioMap = useMemo(() => {
    return musicOptions.reduce((acc, option) => {
      if (option.audioFile) {
        acc[option.id] = option.audioFile
      }
      return acc
    }, {})
  }, [])

  useEffect(() => {
    const stored = (() => {
      if (typeof window === 'undefined') return null
      return window.localStorage.getItem('yoga-voice-authenticated')
    })()
    if (stored === 'true') {
      setIsAuthenticated(true)
    }
    setAuthChecked(true)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (isAuthenticated) {
      window.localStorage.setItem('yoga-voice-authenticated', 'true')
    } else if (authChecked) {
      window.localStorage.removeItem('yoga-voice-authenticated')
    }
  }, [isAuthenticated, authChecked])

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
          speed,
          stability,
          similarity_boost: similarityBoost,
        },
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

  const handleDownload = async () => {
    if (!audioBlob) {
      setErrorMessage('Generate audio before attempting to download.')
      return
    }

    const backgroundUrl = backgroundAudioMap[selectedMusic]
    const shouldMix = Boolean(backgroundUrl) && backgroundVolume > 0

    let blobToDownload = audioBlob
    let mixedResult = false

    if (shouldMix) {
      setIsDownloading(true)
      try {
        const mixedBlob = await mixAudioWithBackground({
          speechBlob: audioBlob,
          backgroundUrl,
          backgroundVolume,
        })
        if (mixedBlob) {
          blobToDownload = mixedBlob
          mixedResult = mixedBlob !== audioBlob
        }
      } catch (error) {
        console.error(error)
        setErrorMessage('Unable to mix audio for download. Please try again.')
      } finally {
        setIsDownloading(false)
      }
    }

    const downloadUrl = URL.createObjectURL(blobToDownload)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = `yoga-voice-${Date.now()}${mixedResult ? '-mixed.wav' : '.mp3'}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(downloadUrl)
  }

  const handleRegenerate = () => {
    generateAudio()
  }

  const handlePasswordSubmit = (event) => {
    event.preventDefault()
    if (!APP_PASSWORD) {
      setAuthError('Missing VITE_APP_PASSWORD. Please configure your .env file.')
      return
    }

    if (passwordInput === APP_PASSWORD) {
      setIsAuthenticated(true)
      setPasswordInput('')
      setAuthError('')
    } else {
      setAuthError('Incorrect password. Please try again.')
    }
  }

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAF9]">
        <p className="text-yoga-gray-dark">Loading…</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAF9] px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-semibold text-yoga-purple-dark mb-4 text-center">Yoga Voice</h1>
          <p className="text-sm text-yoga-gray-dark mb-6 text-center">
            Enter the access password to continue.
          </p>
          <form className="space-y-4" onSubmit={handlePasswordSubmit}>
            <div>
              <label className="block text-sm font-medium text-yoga-gray-dark mb-2" htmlFor="app-password">
                Password
              </label>
              <input
                id="app-password"
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-yoga-gray-light focus:outline-none focus:ring-2 focus:ring-yoga-purple-DEFAULT"
                placeholder="••••••••"
              />
            </div>
            {authError && <p className="text-sm text-red-600">{authError}</p>}
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-yoga-purple-DEFAULT text-white font-semibold hover:bg-yoga-purple-dark transition-colors duration-200"
            >
              Enter
            </button>
          </form>
        </div>
      </div>
    )
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

        {/* Voice Controls */}
        <div className="mb-10">
          <div className="grid gap-6 md:grid-cols-3">
            <div>
              <div className="flex items-center justify-between text-sm text-yoga-gray-dark mb-2">
                <span>Speed</span>
                <span>{speed.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.7"
                max="1.2"
                step="0.01"
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="w-full accent-yoga-purple-DEFAULT"
              />
            </div>
            <div>
              <div className="flex items-center justify-between text-sm text-yoga-gray-dark mb-2">
                <span>Stability</span>
                <span>{Math.round(stability * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={stability}
                onChange={(e) => setStability(Number(e.target.value))}
                className="w-full accent-yoga-purple-DEFAULT"
              />
            </div>
            <div>
              <div className="flex items-center justify-between text-sm text-yoga-gray-dark mb-2">
                <span>Similarity boost</span>
                <span>{Math.round(similarityBoost * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={similarityBoost}
                onChange={(e) => setSimilarityBoost(Number(e.target.value))}
                className="w-full accent-yoga-purple-DEFAULT"
              />
            </div>
          </div>
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
            {isDownloading ? 'Preparing...' : 'Download audio'}
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

const getAudioContext = () => {
  if (typeof window === 'undefined') {
    throw new Error('AudioContext is not available in this environment.')
  }

  const AudioCtx = window.AudioContext || window.webkitAudioContext
  if (!AudioCtx) {
    throw new Error('Web Audio API is not supported in this browser.')
  }

  try {
    return new AudioCtx({ sampleRate: 44100 })
  } catch (error) {
    return new AudioCtx()
  }
}

const getMonoChannelData = (audioBuffer) => {
  const { numberOfChannels, length } = audioBuffer

  if (numberOfChannels === 0 || length === 0) {
    return new Float32Array(0)
  }
  const result = new Float32Array(length)
  for (let channelIndex = 0; channelIndex < numberOfChannels; channelIndex += 1) {
    const channelData = audioBuffer.getChannelData(channelIndex)
    for (let i = 0; i < length; i += 1) {
      result[i] += channelData[i]
    }
  }
  for (let i = 0; i < length; i += 1) {
    result[i] /= numberOfChannels
  }
  return result
}

const loopBackgroundToLength = (data, targetLength) => {
  if (data.length === 0) {
    return new Float32Array(targetLength)
  }

  if (data.length === targetLength) {
    return new Float32Array(data)
  }

  const result = new Float32Array(targetLength)
  for (let i = 0; i < targetLength; i += 1) {
    result[i] = data[i % data.length]
  }
  return result
}

const applyFades = (data, sampleRate, fadeInDuration, fadeOutDuration) => {
  const fadeInSamples = Math.min(Math.floor(fadeInDuration * sampleRate), data.length)
  for (let i = 0; i < fadeInSamples; i += 1) {
    data[i] *= i / fadeInSamples
  }

  const fadeOutSamples = Math.min(Math.floor(fadeOutDuration * sampleRate), data.length)
  for (let i = 0; i < fadeOutSamples; i += 1) {
    const idx = data.length - fadeOutSamples + i
    if (idx >= 0) {
      data[idx] *= 1 - i / fadeOutSamples
    }
  }
}

const normalizeSamples = (samples, targetPeak = 0.95) => {
  let max = 0
  for (let i = 0; i < samples.length; i += 1) {
    max = Math.max(max, Math.abs(samples[i]))
  }

  if (max === 0) return

  const scale = targetPeak / max
  if (scale >= 1) return

  for (let i = 0; i < samples.length; i += 1) {
    samples[i] *= scale
  }
}

const encodeWav = (samples, sampleRate) => {
  const buffer = new ArrayBuffer(44 + samples.length * 2)
  const view = new DataView(buffer)

  const writeString = (offset, string) => {
    for (let i = 0; i < string.length; i += 1) {
      view.setUint8(offset + i, string.charCodeAt(i))
    }
  }

  let offset = 0
  writeString(offset, 'RIFF')
  offset += 4
  view.setUint32(offset, 36 + samples.length * 2, true)
  offset += 4
  writeString(offset, 'WAVEfmt ')
  offset += 8
  view.setUint32(offset, 16, true)
  offset += 4
  view.setUint16(offset, 1, true) // audio format (PCM)
  offset += 2
  view.setUint16(offset, 1, true) // channels
  offset += 2
  view.setUint32(offset, sampleRate, true)
  offset += 4
  view.setUint32(offset, sampleRate * 2, true)
  offset += 4
  view.setUint16(offset, 2, true)
  offset += 2
  view.setUint16(offset, 16, true)
  offset += 2
  writeString(offset, 'data')
  offset += 4
  view.setUint32(offset, samples.length * 2, true)
  offset += 4

  for (let i = 0; i < samples.length; i += 1) {
    const s = Math.max(-1, Math.min(1, samples[i]))
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true)
    offset += 2
  }

  return new Blob([buffer], { type: 'audio/wav' })
}

const mixAudioWithBackground = async ({
  speechBlob,
  backgroundUrl,
  backgroundVolume,
  fadeInDuration = 2,
  fadeOutDuration = 3,
}) => {
  if (!backgroundUrl || backgroundVolume <= 0) {
    return speechBlob
  }

  const audioContext = getAudioContext()

  try {
    const [speechBuffer, backgroundBuffer] = await Promise.all([
      speechBlob.arrayBuffer().then((buffer) => audioContext.decodeAudioData(buffer.slice(0))),
      fetch(backgroundUrl)
        .then((response) => response.arrayBuffer())
        .then((buffer) => audioContext.decodeAudioData(buffer)),
    ])

    const sampleRate = audioContext.sampleRate
    const speechData = getMonoChannelData(speechBuffer)
    const backgroundMono = getMonoChannelData(backgroundBuffer)

    const targetLength = speechData.length
    const backgroundData = loopBackgroundToLength(backgroundMono, targetLength)
    applyFades(backgroundData, sampleRate, fadeInDuration, fadeOutDuration)

    for (let i = 0; i < backgroundData.length; i += 1) {
      backgroundData[i] *= backgroundVolume
    }

    const mixedData = new Float32Array(targetLength)
    for (let i = 0; i < targetLength; i += 1) {
      mixedData[i] = speechData[i] + backgroundData[i]
    }

    normalizeSamples(mixedData)
    return encodeWav(mixedData, sampleRate)
  } finally {
    audioContext.close()
  }
}

