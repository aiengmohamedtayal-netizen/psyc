import React, { useState, useEffect } from 'react'

export default function BreathingModal({ isOpen, onClose }) {
  const [activeTechnique, setActiveTechnique] = useState('478') // '478' | 'box' | 'grounding' | 'pmr'
  const [phase, setPhase] = useState('Inhale')
  const [secondsLeft, setSecondsLeft] = useState(4)
  const [cycle, setCycle] = useState(1)

  // Grounding technique step (5 down to 1)
  const [groundingStep, setGroundingStep] = useState(5)
  // PMR step (1 to 5)
  const [pmrStep, setPmrStep] = useState(1)

  useEffect(() => {
    if (!isOpen) {
      setPhase('Inhale')
      setSecondsLeft(4)
      setCycle(1)
      setGroundingStep(5)
      setPmrStep(1)
      return
    }

    if (activeTechnique === 'grounding' || activeTechnique === 'pmr') return

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev > 1) return prev - 1

        if (activeTechnique === '478') {
          // 4-7-8 Technique
          if (phase === 'Inhale') {
            setPhase('Hold')
            return 7
          } else if (phase === 'Hold') {
            setPhase('Exhale')
            return 8
          } else {
            setPhase('Inhale')
            setCycle((c) => c + 1)
            return 4
          }
        } else {
          // Box Breathing (4-4-4-4)
          if (phase === 'Inhale') {
            setPhase('Hold')
            return 4
          } else if (phase === 'Hold') {
            setPhase('Exhale')
            return 4
          } else if (phase === 'Exhale') {
            setPhase('Rest')
            return 4
          } else {
            setPhase('Inhale')
            setCycle((c) => c + 1)
            return 4
          }
        }
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isOpen, phase, activeTechnique])

  if (!isOpen) return null

  const getPhaseColor = () => {
    switch (phase) {
      case 'Inhale': return '#cc785c'
      case 'Hold': return '#eab308'
      case 'Exhale': return '#38bdf8'
      case 'Rest': return '#a855f7'
      default: return '#cc785c'
    }
  }

  const getPhaseArabic = () => {
    switch (phase) {
      case 'Inhale': return 'شهيق عميق بهدوء'
      case 'Hold': return 'احبس النفس واسترخِ'
      case 'Exhale': return 'زفير بطيء ومريح'
      case 'Rest': return 'وقفة هادئة وثبات'
      default: return 'تنفس بعمق'
    }
  }

  const groundingData = {
    5: { count: '٥ أشياء تراها بعينيك', icon: '👁️', desc: 'انظر حولك ولاحظ 5 أشياء واضحة في الغرفة (لون الحائط، زر، قلم، ضوء، ستارة).' },
    4: { count: '٤ أشياء تلمسها وتشعر بها', icon: '✋', desc: 'المس 4 أشياء حولك واستشعر ملمسها (قماش ملابسك، ملمس الطاولة، برودة الهاتف، قدمك على الأرض).' },
    3: { count: '٣ أصوات تسمعها الآن', icon: '👂', desc: 'أنصت جيداً ولاحظ 3 أصوات خفيفة في محيطك (صوت مروحة، حركة في الخارج، نبضات تنفسك).' },
    2: { count: 'شيئان تشم رائحتهما', icon: '👃', desc: 'لاحظ رائحة في المكان (قهوة، معطر، أو حتى رائحة الهواء المنعش).' },
    1: { count: 'شيء واحد تتذوقه', icon: '👅', desc: 'لاحظ طعم فمك الحالي أو خذ رشفة ماء باردة بوعي كامل.' },
  }

  const pmrData = {
    1: { title: 'الخطوة ١: اليدان والساعدان', icon: '✊', instruction: 'اقبض يديك بقوة شديدة واحبس الشد لـ 5 ثوانٍ... ثم افتح أصابعك فجأة واستشعر كيف ينساب التوتر من يديك.' },
    2: { title: 'الخطوة ٢: الكتفان والرقبة', icon: '💆‍♂️', instruction: 'ارفع كتفيك لأعلى نحو أذنيك واضغط بقوة لـ 5 ثوانٍ... ثم دعهما يسقطان لأسفل براحة تامة.' },
    3: { title: 'الخطوة ٣: الوجه والفكين', icon: '😌', instruction: 'أغمض عينيك بشدة واضغط شفتيك وفكيك لـ 5 ثوانٍ... ثم أرخِ كل ملامح وجهك ودع فكك يسترخي طبيعياً.' },
    4: { title: 'الخطوة ٤: الصدر والبطن', icon: '🫁', instruction: 'خذ نفساً عميقاً واشد عضلات بطنك للداخل لـ 5 ثوانٍ... ثم ازفر بهدوء واستشعر خفة وانسيابية عضلاتك.' },
    5: { title: 'الخطوة ٥: الساقان والقدمان', icon: '🦶', instruction: 'اثنِ أصابع قدميك لأسفل واشد عضلات ساقيك لـ 5 ثوانٍ... ثم أرخِ ساقيك بالكامل ودع الثقل والراحة يسريان فيهما.' },
  }

  return (
    <div className="search-modal-overlay" style={{ alignItems: 'center', paddingTop: 0 }}>
      <div className="search-modal-content" style={{ maxWidth: '500px', padding: '28px 24px', position: 'relative' }}>
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

        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <span style={{ fontSize: '2rem' }}>🧘</span>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', color: '#fbf9f5', marginTop: '4px' }}>
            تمارين الاسترخاء والتأريض السريري
          </h2>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            تقنيات سريرية معتمدة لتحفيز العصب الحائر وتفكيك نوبات الهلع فورياً
          </p>
        </div>

        {/* Technique Selector Tabs */}
        <div className="auth-tabs" style={{ marginBottom: '20px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px' }}>
          <button
            className={`auth-tab ${activeTechnique === '478' ? 'active' : ''}`}
            onClick={() => { setActiveTechnique('478'); setPhase('Inhale'); setSecondsLeft(4) }}
            style={{ fontSize: '0.78rem', padding: '7px 4px' }}
          >
            4-7-8
          </button>
          <button
            className={`auth-tab ${activeTechnique === 'box' ? 'active' : ''}`}
            onClick={() => { setActiveTechnique('box'); setPhase('Inhale'); setSecondsLeft(4) }}
            style={{ fontSize: '0.78rem', padding: '7px 4px' }}
          >
            الصندوق (Box)
          </button>
          <button
            className={`auth-tab ${activeTechnique === 'grounding' ? 'active' : ''}`}
            onClick={() => setActiveTechnique('grounding')}
            style={{ fontSize: '0.78rem', padding: '7px 4px' }}
          >
            تأريض 5-4-3-2-1
          </button>
          <button
            className={`auth-tab ${activeTechnique === 'pmr' ? 'active' : ''}`}
            onClick={() => setActiveTechnique('pmr')}
            style={{ fontSize: '0.78rem', padding: '7px 4px' }}
          >
            استرخاء العضلات (PMR)
          </button>
        </div>

        {activeTechnique === '478' || activeTechnique === 'box' ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div
              style={{
                width: '170px',
                height: '170px',
                borderRadius: '50%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: `radial-gradient(circle, ${getPhaseColor()}22 0%, rgba(31, 30, 29, 0.4) 70%)`,
                border: `3px solid ${getPhaseColor()}`,
                boxShadow: `0 0 35px ${getPhaseColor()}33`,
                transition: 'all 0.5s ease',
                margin: '10px 0 20px',
                transform: phase === 'Inhale' ? 'scale(1.15)' : phase === 'Exhale' ? 'scale(0.88)' : 'scale(1.05)',
              }}
            >
              <span style={{ fontSize: '2.4rem', fontWeight: 800, color: '#fff', lineHeight: 1 }}>
                {secondsLeft}
              </span>
              <span style={{ fontSize: '0.86rem', color: getPhaseColor(), fontWeight: 600, marginTop: '6px' }}>
                {phase}
              </span>
            </div>

            <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#fbf9f5', marginBottom: '4px' }}>
              {getPhaseArabic()}
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-subtle)', marginBottom: '16px' }}>
              الدورة رقم: {cycle}
            </div>
          </div>
        ) : activeTechnique === 'grounding' ? (
          /* 5-4-3-2-1 Sensory Grounding */
          <div style={{ textAlign: 'center', padding: '10px 4px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '8px' }}>
              {groundingData[groundingStep].icon}
            </div>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--accent)', marginBottom: '8px' }}>
              {groundingData[groundingStep].count}
            </div>
            <p style={{ fontSize: '0.92rem', color: '#ece7de', lineHeight: 1.7, marginBottom: '22px' }}>
              {groundingData[groundingStep].desc}
            </p>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
              <button
                disabled={groundingStep === 1}
                onClick={() => setGroundingStep((s) => s - 1)}
                className="auth-submit-btn"
                style={{ width: 'auto', padding: '8px 24px' }}
              >
                {groundingStep > 1 ? 'الخطوة التالية ➔' : 'تم الانتهاء بنجاح ✓'}
              </button>
              {groundingStep === 1 && (
                <button
                  onClick={() => setGroundingStep(5)}
                  style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-muted)', padding: '8px 16px', borderRadius: '10px', cursor: 'pointer' }}
                >
                  إعادة من البداية
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Progressive Muscle Relaxation (PMR) */
          <div style={{ textAlign: 'center', padding: '10px 4px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '8px' }}>
              {pmrData[pmrStep].icon}
            </div>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--accent)', marginBottom: '8px' }}>
              {pmrData[pmrStep].title}
            </div>
            <p style={{ fontSize: '0.92rem', color: '#ece7de', lineHeight: 1.7, marginBottom: '22px' }}>
              {pmrData[pmrStep].instruction}
            </p>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
              <button
                disabled={pmrStep === 5}
                onClick={() => setPmrStep((s) => s + 1)}
                className="auth-submit-btn"
                style={{ width: 'auto', padding: '8px 24px' }}
              >
                {pmrStep < 5 ? 'المجموعة التالية ➔' : 'تم إرخاء كامل الجسد بنجاح ✓'}
              </button>
              {pmrStep === 5 && (
                <button
                  onClick={() => setPmrStep(1)}
                  style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-muted)', padding: '8px 16px', borderRadius: '10px', cursor: 'pointer' }}
                >
                  إعادة التمرين
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
