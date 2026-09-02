import React from 'react'
import { useBreathingCycle } from '../hooks/useBreathingCycle.js'
import {
  GROUNDING_STEPS,
  PMR_STEPS,
  PHASE_CONFIG,
} from '../data/relaxationData.js'

/**
 * Breathing & Somatic Relaxation Modal.
 * Offers guided 4-7-8, Box Breathing, 5-4-3-2-1 Sensory Grounding,
 * and Progressive Muscle Relaxation (PMR).
 */
export default function BreathingModal({ isOpen, onClose }) {
  const {
    activeTechnique,
    setActiveTechnique,
    phase,
    secondsLeft,
    cycle,
    groundingStep,
    setGroundingStep,
    pmrStep,
    setPmrStep,
  } = useBreathingCycle(isOpen)

  if (!isOpen) return null

  const currentPhaseConfig = PHASE_CONFIG[phase] || PHASE_CONFIG.Inhale
  const phaseColor = currentPhaseConfig.color
  const phaseArabic = currentPhaseConfig.label

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
          maxWidth: '500px',
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
        <div
          className="auth-tabs"
          style={{
            marginBottom: '20px',
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '4px',
          }}
        >
          <button
            type="button"
            className={`auth-tab ${activeTechnique === '478' ? 'active' : ''}`}
            onClick={() => setActiveTechnique('478')}
            style={{ fontSize: '0.78rem', padding: '7px 4px' }}
          >
            4-7-8
          </button>
          <button
            type="button"
            className={`auth-tab ${activeTechnique === 'box' ? 'active' : ''}`}
            onClick={() => setActiveTechnique('box')}
            style={{ fontSize: '0.78rem', padding: '7px 4px' }}
          >
            الصندوق (Box)
          </button>
          <button
            type="button"
            className={`auth-tab ${activeTechnique === 'grounding' ? 'active' : ''}`}
            onClick={() => setActiveTechnique('grounding')}
            style={{ fontSize: '0.78rem', padding: '7px 4px' }}
          >
            تأريض 5-4-3-2-1
          </button>
          <button
            type="button"
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
                background: `radial-gradient(circle, ${phaseColor}22 0%, rgba(31, 30, 29, 0.4) 70%)`,
                border: `3px solid ${phaseColor}`,
                boxShadow: `0 0 35px ${phaseColor}33`,
                transition: 'all 0.5s ease',
                margin: '10px 0 20px',
                transform:
                  phase === 'Inhale'
                    ? 'scale(1.15)'
                    : phase === 'Exhale'
                    ? 'scale(0.88)'
                    : 'scale(1.05)',
              }}
            >
              <span style={{ fontSize: '2.4rem', fontWeight: 800, color: '#fff', lineHeight: 1 }}>
                {secondsLeft}
              </span>
              <span style={{ fontSize: '0.86rem', color: phaseColor, fontWeight: 600, marginTop: '6px' }}>
                {phase}
              </span>
            </div>

            <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#fbf9f5', marginBottom: '4px' }}>
              {phaseArabic}
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-subtle)', marginBottom: '16px' }}>
              الدورة رقم: {cycle}
            </div>
          </div>
        ) : activeTechnique === 'grounding' ? (
          /* 5-4-3-2-1 Sensory Grounding */
          <div style={{ textAlign: 'center', padding: '10px 4px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '8px' }}>
              {GROUNDING_STEPS[groundingStep]?.icon}
            </div>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--accent)', marginBottom: '8px' }}>
              {GROUNDING_STEPS[groundingStep]?.count}
            </div>
            <p style={{ fontSize: '0.92rem', color: '#ece7de', lineHeight: 1.7, marginBottom: '22px' }}>
              {GROUNDING_STEPS[groundingStep]?.desc}
            </p>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
              <button
                type="button"
                disabled={groundingStep === 1}
                onClick={() => setGroundingStep((s) => s - 1)}
                className="auth-submit-btn"
                style={{ width: 'auto', padding: '8px 24px' }}
              >
                {groundingStep > 1 ? 'الخطوة التالية ➔' : 'تم الانتهاء بنجاح ✓'}
              </button>
              {groundingStep === 1 && (
                <button
                  type="button"
                  onClick={() => setGroundingStep(5)}
                  style={{
                    background: 'transparent',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-muted)',
                    padding: '8px 16px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                  }}
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
              {PMR_STEPS[pmrStep]?.icon}
            </div>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--accent)', marginBottom: '8px' }}>
              {PMR_STEPS[pmrStep]?.title}
            </div>
            <p style={{ fontSize: '0.92rem', color: '#ece7de', lineHeight: 1.7, marginBottom: '22px' }}>
              {PMR_STEPS[pmrStep]?.instruction}
            </p>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
              <button
                type="button"
                disabled={pmrStep === 5}
                onClick={() => setPmrStep((s) => s + 1)}
                className="auth-submit-btn"
                style={{ width: 'auto', padding: '8px 24px' }}
              >
                {pmrStep < 5 ? 'المجموعة التالية ➔' : 'تم إرخاء كامل الجسد بنجاح ✓'}
              </button>
              {pmrStep === 5 && (
                <button
                  type="button"
                  onClick={() => setPmrStep(1)}
                  style={{
                    background: 'transparent',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-muted)',
                    padding: '8px 16px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                  }}
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
