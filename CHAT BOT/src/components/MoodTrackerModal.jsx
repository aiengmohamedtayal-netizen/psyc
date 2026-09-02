import React, { useState, useEffect } from 'react'

const MOOD_STORAGE_KEY = 'stress_ai_mood_logs'

const MOODS = [
  { level: 1, emoji: '😫', label: 'إرهاق شديد', color: '#ef4444' },
  { level: 2, emoji: '😟', label: 'قلق وتوتر', color: '#f97316' },
  { level: 3, emoji: '😐', label: 'مستقر / هادئ', color: '#eab308' },
  { level: 4, emoji: '🙂', label: 'جيد وإيجابي', color: '#84cc16' },
  { level: 5, emoji: '😊', label: 'مرتاح ومبتهج', color: '#22c55e' },
]

export default function MoodTrackerModal({ isOpen, onClose }) {
  const [selectedLevel, setSelectedLevel] = useState(3)
  const [note, setNote] = useState('')
  const [loggedToday, setLoggedToday] = useState(false)
  const [moodLogs, setMoodLogs] = useState(() => {
    try {
      const data = localStorage.getItem(MOOD_STORAGE_KEY)
      return data ? JSON.parse(data) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    if (isOpen) {
      const todayStr = new Date().toISOString().slice(0, 10)
      const existing = moodLogs.find((m) => m.dateStr === todayStr)
      if (existing) {
        setLoggedToday(true)
        setSelectedLevel(existing.level)
        setNote(existing.note || '')
      } else {
        setLoggedToday(false)
        setSelectedLevel(3)
        setNote('')
      }
    }
  }, [isOpen, moodLogs])

  if (!isOpen) return null

  const handleSaveMood = () => {
    const todayStr = new Date().toISOString().slice(0, 10)
    const newEntry = {
      id: Date.now(),
      level: selectedLevel,
      note: note.trim(),
      dateStr: todayStr,
      displayDate: new Date().toLocaleDateString('ar-EG', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      }),
    }

    const filtered = moodLogs.filter((m) => m.dateStr !== todayStr)
    const updated = [newEntry, ...filtered].slice(0, 30) // Keep last 30 entries
    setMoodLogs(updated)
    try {
      localStorage.setItem(MOOD_STORAGE_KEY, JSON.stringify(updated))
    } catch {}
    setLoggedToday(true)
  }

  // Calculate average mood
  const avgMood =
    moodLogs.length > 0
      ? (moodLogs.reduce((acc, cur) => acc + cur.level, 0) / moodLogs.length).toFixed(1)
      : null

  return (
    <div
      className="search-modal-overlay"
      style={{ alignItems: 'center', paddingTop: 0 }}
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) onClose()
      }}
    >
      <div
        className="search-modal-content"
        style={{
          maxWidth: '520px',
          width: '92%',
          padding: '28px 24px',
          position: 'relative',
          background: 'var(--bg-card, #272522)',
          border: '1px solid var(--border-color, #383531)',
          borderRadius: '12px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="close-search-btn"
          onClick={onClose}
          style={{ position: 'absolute', top: '16px', right: '16px' }}
          title="إغلاق (Esc)"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '18px' }}>
          <span style={{ fontSize: '2.2rem' }}>📊</span>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.65rem', color: '#fbf9f5', margin: '4px 0 6px' }}>
            متابعة الحالة المزاجية (Mood Tracker)
          </h2>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-subtle, #a09a90)', margin: 0 }}>
            سجل نبضك النفسي يومياً لمراقبة مسار استقرارك والتعافي عبر الأسابيع
          </p>
        </div>

        {/* Mood Selection Picker */}
        <div style={{ marginBottom: '18px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
            كيف تشعر في هذه اللحظة؟
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
            {MOODS.map((m) => {
              const isSelected = selectedLevel === m.level
              return (
                <button
                  key={m.level}
                  type="button"
                  onClick={() => {
                    setSelectedLevel(m.level)
                    setLoggedToday(false)
                  }}
                  style={{
                    padding: '12px 6px',
                    borderRadius: '10px',
                    background: isSelected ? `${m.color}22` : 'var(--bg-main, #1f1e1d)',
                    border: `2px solid ${isSelected ? m.color : 'var(--border-subtle)'}`,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'all 0.18s ease',
                    transform: isSelected ? 'scale(1.05)' : 'none',
                  }}
                >
                  <span style={{ fontSize: '1.8rem' }}>{m.emoji}</span>
                  <span style={{ fontSize: '0.72rem', color: isSelected ? m.color : 'var(--text-subtle)', fontWeight: isSelected ? 600 : 400 }}>
                    {m.label}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Note input */}
        <div style={{ marginBottom: '16px' }}>
          <input
            type="text"
            placeholder="ملاحظة سريعة اختيارية (مثل: بعد جلسة التنفس، ضغط امتحانات...)"
            value={note}
            onChange={(e) => {
              setNote(e.target.value)
              setLoggedToday(false)
            }}
            style={{
              width: '100%',
              padding: '10px 12px',
              background: 'var(--bg-main, #1f1e1d)',
              border: '1px solid var(--border-color, #383531)',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '0.86rem',
              outline: 'none',
              boxSizing: 'border-box',
              direction: 'rtl',
              fontFamily: 'inherit',
            }}
          />
        </div>

        <button
          type="button"
          onClick={handleSaveMood}
          className="auth-submit-btn"
          style={{ marginBottom: '22px' }}
        >
          {loggedToday ? '✓ تم حفظ المزاج اليومي بنجاح' : 'حفظ مزاج اليوم ➔'}
        </button>

        {/* History / Trajectory Overview */}
        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.86rem', fontWeight: 600, color: '#fbf9f5' }}>
              سجل الأيام السابقة ({moodLogs.length})
            </span>
            {avgMood && (
              <span style={{ fontSize: '0.78rem', color: 'var(--accent)', background: 'rgba(204, 120, 92, 0.15)', padding: '2px 8px', borderRadius: '6px' }}>
                متوسط المزاج: {avgMood} / 5
              </span>
            )}
          </div>

          <div style={{ maxHeight: '160px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '4px' }}>
            {moodLogs.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-subtle)', fontSize: '0.82rem', padding: '16px 0' }}>
                لم تقم بتسجيل أي أيام بعد. ابدأ اليوم بمتابعة مؤشراتك.
              </div>
            ) : (
              moodLogs.map((log) => {
                const moodObj = MOODS.find((m) => m.level === log.level) || MOODS[2]
                return (
                  <div
                    key={log.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      background: 'var(--bg-main, #1f1e1d)',
                      borderRadius: '8px',
                      border: '1px solid var(--border-subtle)',
                      direction: 'rtl',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '1.2rem' }}>{moodObj.emoji}</span>
                      <div>
                        <span style={{ fontSize: '0.82rem', fontWeight: 600, color: moodObj.color }}>
                          {moodObj.label}
                        </span>
                        {log.note && (
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', marginRight: '8px' }}>
                            ({log.note})
                          </span>
                        )}
                      </div>
                    </div>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-subtle)' }}>
                      {log.displayDate}
                    </span>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
