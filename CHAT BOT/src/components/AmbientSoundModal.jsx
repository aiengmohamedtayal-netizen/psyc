import React, { useState, useEffect, useRef } from 'react'

export default function AmbientSoundModal({ isOpen, onClose }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [selectedSound, setSelectedSound] = useState('rain') // 'rain' | 'ocean' | 'zen'
  const [volume, setVolume] = useState(0.5)

  const audioCtxRef = useRef(null)
  const gainNodeRef = useRef(null)
  const soundNodesRef = useRef([])

  const stopAudio = () => {
    soundNodesRef.current.forEach((node) => {
      try {
        node.stop && node.stop()
        node.disconnect && node.disconnect()
      } catch {}
    })
    soundNodesRef.current = []
    setIsPlaying(false)
  }

  const startAudio = () => {
    stopAudio()

    const AudioContext = window.AudioContext || window.webkitAudioContext
    if (!AudioContext) return

    if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
      audioCtxRef.current = new AudioContext()
    }

    const ctx = audioCtxRef.current
    if (ctx.state === 'suspended') {
      ctx.resume()
    }

    const masterGain = ctx.createGain()
    masterGain.gain.setValueAtTime(volume, ctx.currentTime)
    masterGain.connect(ctx.destination)
    gainNodeRef.current = masterGain

    if (selectedSound === 'rain') {
      // Synthesize Brown/Pink Rain Noise
      const bufferSize = ctx.sampleRate * 2
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
      const output = noiseBuffer.getChannelData(0)
      let lastOut = 0.0

      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1
        output[i] = (lastOut + 0.02 * white) / 1.02 // Brown noise
        lastOut = output[i]
        output[i] *= 3.5 // Gain compensation
      }

      const whiteNoise = ctx.createBufferSource()
      whiteNoise.buffer = noiseBuffer
      whiteNoise.loop = true

      const filter = ctx.createBiquadFilter()
      filter.type = 'lowpass'
      filter.frequency.setValueAtTime(850, ctx.currentTime)

      whiteNoise.connect(filter)
      filter.connect(masterGain)
      whiteNoise.start()

      soundNodesRef.current = [whiteNoise, filter]
    } else if (selectedSound === 'ocean') {
      // Synthesize Ocean Waves with Periodic LFO Surge
      const bufferSize = ctx.sampleRate * 2
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
      const output = noiseBuffer.getChannelData(0)
      let b0 = 0, b1 = 0, b2 = 0

      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1
        b0 = 0.99886 * b0 + white * 0.0555179
        b1 = 0.99332 * b1 + white * 0.0750759
        b2 = 0.96900 * b2 + white * 0.1538520
        output[i] = (b0 + b1 + b2) * 0.2
      }

      const pinkNoise = ctx.createBufferSource()
      pinkNoise.buffer = noiseBuffer
      pinkNoise.loop = true

      const filter = ctx.createBiquadFilter()
      filter.type = 'lowpass'
      filter.frequency.setValueAtTime(450, ctx.currentTime)

      const waveGain = ctx.createGain()
      waveGain.gain.setValueAtTime(0.3, ctx.currentTime)

      // LFO for wave surging cycle (every 6 seconds)
      const lfo = ctx.createOscillator()
      lfo.frequency.setValueAtTime(0.16, ctx.currentTime) // ~6s period
      const lfoGain = ctx.createGain()
      lfoGain.gain.setValueAtTime(0.35, ctx.currentTime)
      lfo.connect(lfoGain)
      lfoGain.connect(waveGain.gain)

      pinkNoise.connect(filter)
      filter.connect(waveGain)
      waveGain.connect(masterGain)

      lfo.start()
      pinkNoise.start()

      soundNodesRef.current = [pinkNoise, filter, waveGain, lfo, lfoGain]
    } else if (selectedSound === 'zen') {
      // 432Hz Binaural Theta Meditation Drone (432Hz + 436Hz -> 4Hz Theta beat)
      const osc1 = ctx.createOscillator()
      const osc2 = ctx.createOscillator()
      const subOsc = ctx.createOscillator()

      osc1.type = 'sine'
      osc1.frequency.setValueAtTime(432, ctx.currentTime)

      osc2.type = 'sine'
      osc2.frequency.setValueAtTime(436, ctx.currentTime)

      subOsc.type = 'sine'
      subOsc.frequency.setValueAtTime(216, ctx.currentTime)

      const droneGain = ctx.createGain()
      droneGain.gain.setValueAtTime(0.2, ctx.currentTime)

      osc1.connect(droneGain)
      osc2.connect(droneGain)
      subOsc.connect(droneGain)
      droneGain.connect(masterGain)

      osc1.start()
      osc2.start()
      subOsc.start()

      soundNodesRef.current = [osc1, osc2, subOsc, droneGain]
    }

    setIsPlaying(true)
  }

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value)
    setVolume(val)
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setValueAtTime(val, audioCtxRef.current.currentTime)
    }
  }

  // Restart sound if selection changes while playing
  useEffect(() => {
    if (isPlaying) {
      startAudio()
    }
  }, [selectedSound])

  // Stop sound if unmounting or modal closes
  useEffect(() => {
    return () => {
      stopAudio()
    }
  }, [])

  if (!isOpen) return null

  const sounds = [
    { id: 'rain', name: 'مطر هادئ (Gentle Rain)', icon: '🌧️', desc: 'ضوضاء بنية دافئة تحاكي صوت قطرات المطر المهدئة' },
    { id: 'ocean', name: 'أمواج البحر (Ocean Surf)', icon: '🌊', desc: 'حركات مد وجزر دورية تخفض نشاط القشرة الدماغية' },
    { id: 'zen', name: 'تردد 432Hz للاسترخاء (Zen Drone)', icon: '🧘', desc: 'نغمات ثيتا المزدوجة لتهدئة ضربات القلب والتركيز العميق' },
  ]

  return (
    <div className="search-modal-overlay" style={{ alignItems: 'center', paddingTop: 0 }}>
      <div className="search-modal-content" style={{ maxWidth: '460px', padding: '28px 24px', position: 'relative' }}>
        <button
          className="close-search-btn"
          onClick={onClose}
          style={{ position: 'absolute', top: '16px', right: '16px' }}
          title="Close"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <span style={{ fontSize: '2rem' }}>🎧</span>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', color: '#fbf9f5', marginTop: '6px' }}>
            صوتيات الاسترخاء في الخلفية
          </h2>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            أصوات طبيعية حية مولدة عبر Web Audio API تساعدك على النوم والتركيز
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '22px' }}>
          {sounds.map((s) => (
            <div
              key={s.id}
              onClick={() => setSelectedSound(s.id)}
              style={{
                padding: '12px 14px',
                borderRadius: '12px',
                background: selectedSound === s.id ? 'var(--bg-surface-elevated)' : 'var(--bg-input)',
                border: `1px solid ${selectedSound === s.id ? 'var(--accent)' : 'var(--border-subtle)'}`,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                transition: 'all 0.15s ease',
              }}
            >
              <span style={{ fontSize: '1.4rem' }}>{s.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: '#fff', fontSize: '0.92rem', fontWeight: 600 }}>{s.name}</div>
                <div style={{ color: 'var(--text-subtle)', fontSize: '0.78rem', marginTop: '2px' }}>{s.desc}</div>
              </div>
              {selectedSound === s.id && (
                <span style={{ color: 'var(--accent)', fontWeight: 700, fontSize: '1rem' }}>✓</span>
              )}
            </div>
          ))}
        </div>

        {/* Volume Slider */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
            <span>مستوى الصوت (Volume)</span>
            <span>{Math.round(volume * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={handleVolumeChange}
            style={{ width: '100%', accentColor: 'var(--accent)', cursor: 'pointer' }}
          />
        </div>

        {/* Play/Pause Button */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={isPlaying ? stopAudio : startAudio}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: '12px',
              border: 'none',
              background: isPlaying ? '#ef4444' : 'var(--accent)',
              color: '#fff',
              fontSize: '0.95rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.15s ease',
            }}
          >
            <span>{isPlaying ? '⏹ إيقاف الصوت' : '▶ تشغيل الصوت في الخلفية'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
