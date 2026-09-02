import React, { useState, useEffect } from 'react'

const WORRY_STORAGE_KEY = 'stress_ai_worry_notes'

export default function WorryDumpModal({ isOpen, onClose }) {
  const [worryText, setWorryText] = useState('')
  const [isBurning, setIsBurning] = useState(false)
  const [burnedSuccess, setBurnedSuccess] = useState(false)
  const [activeTab, setActiveTab] = useState('write') // 'write' | 'archive'
  const [savedNotes, setSavedNotes] = useState(() => {
    try {
      const data = localStorage.getItem(WORRY_STORAGE_KEY)
      return data ? JSON.parse(data) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    if (!isOpen) {
      setWorryText('')
      setIsBurning(false)
      setBurnedSuccess(false)
      setActiveTab('write')
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleBurnThoughts = () => {
    if (!worryText.trim()) return
    setIsBurning(true)
    setTimeout(() => {
      setIsBurning(false)
      setBurnedSuccess(true)
      setWorryText('')
    }, 1200)
  }

  const handleSaveToArchive = () => {
    const clean = worryText.trim()
    if (!clean) return
    const newNote = {
      id: Date.now(),
      text: clean,
      date: new Date().toLocaleDateString('ar-EG', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    }
    const updated = [newNote, ...savedNotes]
    setSavedNotes(updated)
    try {
      localStorage.setItem(WORRY_STORAGE_KEY, JSON.stringify(updated))
    } catch {}
    setWorryText('')
    setActiveTab('archive')
  }

  const handleDeleteNote = (id) => {
    const updated = savedNotes.filter((n) => n.id !== id)
    setSavedNotes(updated)
    try {
      localStorage.setItem(WORRY_STORAGE_KEY, JSON.stringify(updated))
    } catch {}
  }

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
          <span style={{ fontSize: '2.2rem' }}>💭</span>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.65rem', color: '#fbf9f5', margin: '4px 0 6px' }}>
            مفكرة تفريغ الأفكار (Worry Dump)
          </h2>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-subtle, #a09a90)', margin: 0 }}>
            اكتب كل ما يزعجك ويثقل ذهنك لتفريغه والتخلص من عبئه قبل النوم
          </p>
        </div>

        {/* Tab Switcher */}
        <div
          style={{
            display: 'flex',
            background: 'var(--bg-main, #1f1e1d)',
            padding: '4px',
            borderRadius: '8px',
            marginBottom: '16px',
            border: '1px solid var(--border-subtle, rgba(255,255,255,0.06))',
          }}
        >
          <button
            type="button"
            style={{
              flex: 1,
              padding: '8px',
              borderRadius: '6px',
              border: 'none',
              background: activeTab === 'write' ? 'var(--accent, #cc785c)' : 'transparent',
              color: activeTab === 'write' ? '#fff' : 'var(--text-subtle, #a09a90)',
              fontWeight: activeTab === 'write' ? 600 : 400,
              fontSize: '0.85rem',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
            onClick={() => {
              setActiveTab('write')
              setBurnedSuccess(false)
            }}
          >
            تفريغ جديد ✍️
          </button>
          <button
            type="button"
            style={{
              flex: 1,
              padding: '8px',
              borderRadius: '6px',
              border: 'none',
              background: activeTab === 'archive' ? 'var(--accent, #cc785c)' : 'transparent',
              color: activeTab === 'archive' ? '#fff' : 'var(--text-subtle, #a09a90)',
              fontWeight: activeTab === 'archive' ? 600 : 400,
              fontSize: '0.85rem',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
            onClick={() => setActiveTab('archive')}
          >
            المفكرة المحفوظة ({savedNotes.length}) 📁
          </button>
        </div>

        {activeTab === 'write' ? (
          <div>
            {burnedSuccess ? (
              <div style={{ textAlign: 'center', padding: '24px 10px' }}>
                <div style={{ fontSize: '3rem', marginBottom: '10px' }}>✨</div>
                <h3 style={{ color: '#22c55e', fontSize: '1.2rem', marginBottom: '8px' }}>
                  تم تفريغ الأفكار بنجاح!
                </h3>
                <p style={{ color: 'var(--text-main)', fontSize: '0.9rem', lineHeight: 1.6, maxWidth: '380px', margin: '0 auto 20px' }}>
                  لقد أفرغت هذه الأفكار من عقلك الآن ووضعتها خارجك. دعها ترحل وتنفس بهدوء؛ عقلك يستحق الراحة الآن.
                </p>
                <button
                  onClick={() => setBurnedSuccess(false)}
                  className="auth-submit-btn"
                  style={{ width: 'auto', padding: '8px 24px' }}
                >
                  كتابة تفريغ آخر
                </button>
              </div>
            ) : (
              <div>
                <textarea
                  value={worryText}
                  onChange={(e) => setWorryText(e.target.value)}
                  placeholder="أفرغ هنا كل ما يقلقك، الأفكار المتسارعة، أو المواقف التي تزعجك... لا تتردد، هذه مساحتك الخاصة."
                  rows={6}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    background: 'var(--bg-main, #1f1e1d)',
                    border: '1px solid var(--border-color, #383531)',
                    borderRadius: '10px',
                    color: '#fff',
                    fontSize: '0.92rem',
                    lineHeight: 1.6,
                    outline: 'none',
                    boxSizing: 'border-box',
                    resize: 'none',
                    direction: 'rtl',
                    fontFamily: 'inherit',
                    opacity: isBurning ? 0 : 1,
                    transform: isBurning ? 'scale(0.92) translateY(-10px)' : 'none',
                    filter: isBurning ? 'blur(4px)' : 'none',
                    transition: 'all 0.9s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                  autoFocus
                />

                <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
                  <button
                    type="button"
                    disabled={!worryText.trim() || isBurning}
                    onClick={handleBurnThoughts}
                    style={{
                      flex: 1,
                      padding: '11px',
                      background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: 600,
                      fontSize: '0.88rem',
                      cursor: !worryText.trim() || isBurning ? 'not-allowed' : 'pointer',
                      opacity: !worryText.trim() || isBurning ? 0.5 : 1,
                      transition: 'opacity 0.2s',
                      fontFamily: 'inherit',
                    }}
                    title="تفريغ ذهني رمزي للأفكار ومحوها"
                  >
                    {isBurning ? 'جارٍ التبديد والتحرير... ✨' : '🔥 حرق وتفريغ الأفكار'}
                  </button>

                  <button
                    type="button"
                    disabled={!worryText.trim() || isBurning}
                    onClick={handleSaveToArchive}
                    style={{
                      flex: 1,
                      padding: '11px',
                      background: 'rgba(255, 255, 255, 0.08)',
                      color: 'var(--text-main)',
                      border: '1px solid var(--border-color, #383531)',
                      borderRadius: '8px',
                      fontWeight: 500,
                      fontSize: '0.88rem',
                      cursor: !worryText.trim() || isBurning ? 'not-allowed' : 'pointer',
                      opacity: !worryText.trim() || isBurning ? 0.5 : 1,
                      fontFamily: 'inherit',
                    }}
                  >
                    💾 حفظ في المفكرة
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Archive list */
          <div style={{ maxHeight: '340px', overflowY: 'auto', paddingRight: '4px' }}>
            {savedNotes.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '36px 12px', color: 'var(--text-subtle)' }}>
                لا توجد أفكار محفوظة بعد. يمكنك كتابة وحفظ أفكارك لمتابعتها لاحقاً.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {savedNotes.map((note) => (
                  <div
                    key={note.id}
                    style={{
                      padding: '12px 14px',
                      background: 'var(--bg-main, #1f1e1d)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '10px',
                      direction: 'rtl',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-subtle)' }}>
                        {note.date}
                      </span>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#ef4444',
                          cursor: 'pointer',
                          fontSize: '0.78rem',
                          padding: '2px 4px',
                        }}
                        title="حذف الملاحظة"
                      >
                        حذف ✕
                      </button>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.88rem', color: '#ece7de', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                      {note.text}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
