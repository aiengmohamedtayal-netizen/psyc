import React, { useState, useEffect, useCallback } from 'react'
import { ambientAudioService } from '../services/ambientAudioService.js'

const AMBIENT_SOUND_OPTIONS = [
  {
    id: 'rain',
    name: 'مطر هادئ (Gentle Rain)',
    icon: '🌧️',
    desc: 'ضوضاء بنية دافئة تحاكي صوت قطرات المطر المهدئة',
  },
  {
    id: 'ocean',
    name: 'أمواج البحر (Ocean Surf)',
    icon: '🌊',
    desc: 'حركات مد وجزر دورية تخفض نشاط القشرة الدماغية',
  },
  {
    id: 'zen',
    name: 'تردد 432Hz للاسترخاء (Zen Drone)',
    icon: '🧘',
    desc: 'نغمات ثيتا المزدوجة لتهدئة ضربات القلب والتركيز العميق',
  },
]

/**
 * Ambient Sound Synthesizer Modal.
 * Consumes the AmbientAudioService to synthesize audio in the browser.
 */
export default function AmbientSoundModal({ isOpen, onClose }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [selectedSound, setSelectedSound] = useState('rain')
  const [volume, setVolume] = useState(0.5)

  const stopPlayback = useCallback(() => {
    ambientAudioService.stop()
    setIsPlaying(false)
  }, [])

  const startPlayback = useCallback(() => {
    const success = ambientAudioService.start(selectedSound, volume)
    if (success) {
      setIsPlaying(true)
    }
  }, [selectedSound, volume])

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value)
    setVolume(val)
    ambientAudioService.setVolume(val)
  }

  // Restart sound if selection changes while playing
  useEffect(() => {
    if (isPlaying) {
      startPlayback()
    }
  }, [selectedSound, isPlaying, startPlayback])

  // Stop sound if modal is unmounted or closed
  useEffect(() => {
    return () => {
      stopPlayback()
    }
  }, [stopPlayback])

  if (!isOpen) return null

  return (
    <div
      className="search-modal-overlay"
      style={{ alignItems: 'center', paddingTop: 0 }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="search-modal-content"
        style={{
          maxWidth: '460px',
          padding: '28px 24px',
          position: 'relative',
        }}
      >
        <button
          type="button"
          className="close-search-btn"
          onClick={onClose}
          style={{ position: 'absolute', top: '16px', right: '16px' }}
          title="Close"
          aria-label="Close"
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
          {AMBIENT_SOUND_OPTIONS.map((sound) => {
            const isSelected = selectedSound === sound.id
            return (
              <div
                key={sound.id}
                onClick={() => setSelectedSound(sound.id)}
                role="button"
                tabIndex={0}
                style={{
                  padding: '12px 14px',
                  borderRadius: '12px',
                  background: isSelected
                    ? 'var(--bg-surface-elevated)'
                    : 'var(--bg-input)',
                  border: `1px solid ${
                    isSelected ? 'var(--accent)' : 'var(--border-subtle)'
                  }`,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  transition: 'all 0.15s ease',
                }}
              >
                <span style={{ fontSize: '1.4rem' }}>{sound.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: '#fff', fontSize: '0.92rem', fontWeight: 600 }}>
                    {sound.name}
                  </div>
                  <div style={{ color: 'var(--text-subtle)', fontSize: '0.78rem', marginTop: '2px' }}>
                    {sound.desc}
                  </div>
                </div>
                {isSelected && (
                  <span style={{ color: 'var(--accent)', fontWeight: 700, fontSize: '1rem' }}>✓</span>
                )}
              </div>
            )
          })}
        </div>

        {/* Volume Slider */}
        <div style={{ marginBottom: '20px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
              marginBottom: '6px',
            }}
          >
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
            type="button"
            onClick={isPlaying ? stopPlayback : startPlayback}
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
