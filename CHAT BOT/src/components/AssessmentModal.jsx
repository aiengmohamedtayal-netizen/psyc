import React, { useState } from 'react'
import { CLINICAL_ASSESSMENTS } from '../data/assessmentData.js'
import { calculateAssessmentResult } from '../services/assessmentCalculator.js'
import { exportAssessmentReport } from '../utils/exportAssessmentReport.js'

/**
 * Psychological Assessment Modal.
 * Renders standardized self-assessments (GAD-7, PHQ-9, ISI) with severity feedback,
 * suicide prevention safety trigger, and AI consultation bridge.
 */
export default function AssessmentModal({
  isOpen,
  onClose,
  onStartChatWithResult,
}) {
  const [activeTest, setActiveTest] = useState('gad7')
  const [answers, setAnswers] = useState({})
  const [isSubmitted, setIsSubmitted] = useState(false)

  if (!isOpen) return null

  const currentTest = CLINICAL_ASSESSMENTS[activeTest]
  const totalQuestions = currentTest.questions.length
  const maxScore = totalQuestions * 3

  const { totalScore, answeredCount, severity: result } = calculateAssessmentResult(
    activeTest,
    answers,
    totalQuestions
  )

  const handleSelectOption = (questionIndex, score) => {
    setAnswers((prev) => ({ ...prev, [questionIndex]: score }))
  }

  const handleReset = (testId) => {
    setActiveTest(testId)
    setAnswers({})
    setIsSubmitted(false)
  }

  const handleDiscussWithAI = () => {
    const promptText = `لقد قمت بإجراء فحص «${currentTest.title}»، وحصلت على مجموع درجات (${totalScore}/${maxScore})، والنتيجة تشير إلى: «${result.level}». أرجو تقديم خطة إرشادية وتوجيه عملي لحالتي.`
    onClose()
    onStartChatWithResult(promptText, activeTest === 'isi' ? 'sleep' : 'anxiety')
  }

  const handleExport = () => {
    exportAssessmentReport({
      testTitle: currentTest.title,
      testId: activeTest,
      totalScore,
      maxScore,
      result,
      questions: currentTest.questions,
      answers,
    })
  }

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
          maxWidth: '560px',
          padding: '28px 24px',
          maxHeight: '85vh',
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

        <div style={{ textAlign: 'center', marginBottom: '18px' }}>
          <span style={{ fontSize: '2rem' }}>📝</span>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', color: '#fbf9f5', marginTop: '4px' }}>
            الفحوصات والمقاييس النفسية المقننة
          </h2>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            مقاييس طبية مقننة عالمياً لقياس حدة القلق وكفاءة النوم
          </p>
        </div>

        {/* Test Mode Switcher Tabs */}
        <div className="auth-tabs" style={{ marginBottom: '18px' }}>
          <button
            type="button"
            className={`auth-tab ${activeTest === 'gad7' ? 'active' : ''}`}
            onClick={() => handleReset('gad7')}
          >
            القلق (GAD-7)
          </button>
          <button
            type="button"
            className={`auth-tab ${activeTest === 'phq9' ? 'active' : ''}`}
            onClick={() => handleReset('phq9')}
          >
            الاكتئاب (PHQ-9)
          </button>
          <button
            type="button"
            className={`auth-tab ${activeTest === 'isi' ? 'active' : ''}`}
            onClick={() => handleReset('isi')}
          >
            الأرق (ISI)
          </button>
        </div>

        {!isSubmitted ? (
          <div style={{ overflowY: 'auto', paddingRight: '4px', flex: 1 }}>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-subtle)', marginBottom: '14px', lineHeight: 1.5 }}>
              {currentTest.description} (تمت الإجابة على {answeredCount} من {totalQuestions})
            </p>

            {currentTest.questions.map((question, idx) => (
              <div
                key={idx}
                style={{
                  marginBottom: '16px',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ fontSize: '0.92rem', fontWeight: 600, color: '#fbf9f5', marginBottom: '10px' }}>
                  {idx + 1}. {question}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                  {currentTest.options.map((option) => {
                    const isSelected = answers[idx] === option.score
                    return (
                      <button
                        key={option.score}
                        type="button"
                        onClick={() => handleSelectOption(idx, option.score)}
                        style={{
                          padding: '7px 10px',
                          borderRadius: '8px',
                          border: `1px solid ${isSelected ? 'var(--accent)' : 'rgba(255,255,255,0.06)'}`,
                          background: isSelected ? 'var(--accent-soft)' : 'var(--bg-surface)',
                          color: isSelected ? 'var(--accent)' : 'var(--text-muted)',
                          fontSize: '0.78rem',
                          fontWeight: isSelected ? 600 : 400,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          textAlign: 'center',
                        }}
                      >
                        {option.text}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={() => setIsSubmitted(true)}
              disabled={answeredCount < totalQuestions}
              className="auth-submit-btn"
              style={{
                marginTop: '10px',
                opacity: answeredCount < totalQuestions ? 0.4 : 1,
                cursor: answeredCount < totalQuestions ? 'not-allowed' : 'pointer',
              }}
            >
              عرض النتيجة والتحليل الإكلينيكي ➔
            </button>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '16px 8px' }}>
            <div
              style={{
                display: 'inline-block',
                padding: '8px 20px',
                borderRadius: '9999px',
                background: `${result.color}22`,
                color: result.color,
                fontWeight: 700,
                fontSize: '1rem',
                border: `1px solid ${result.color}55`,
                marginBottom: '16px',
              }}
            >
              {result.level}
            </div>

            <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>
              {totalScore} <span style={{ fontSize: '1.1rem', color: 'var(--text-subtle)' }}>/ {maxScore}</span>
            </div>

            <p style={{ fontSize: '0.92rem', color: 'var(--text-main)', lineHeight: 1.7, marginBottom: '24px', maxWidth: '420px', margin: '0 auto 24px' }}>
              {result.advice}
            </p>

            {/* Question 9 Critical Safety Trigger for PHQ-9 */}
            {activeTest === 'phq9' && answers[8] > 0 && (
              <div
                style={{
                  background: 'rgba(239, 68, 68, 0.14)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  borderRadius: '12px',
                  padding: '14px 16px',
                  marginBottom: '20px',
                  textAlign: 'right',
                  direction: 'rtl',
                }}
              >
                <div style={{ color: '#ef4444', fontWeight: 700, fontSize: '0.95rem', marginBottom: '4px' }}>
                  🚨 تنبيه أمان إكلينيكي عاجل (Safety Trigger)
                </div>
                <div style={{ fontSize: '0.84rem', color: '#fca5a5', lineHeight: 1.5, marginBottom: '12px' }}>
                  لقد أشرت في السؤال التاسع إلى وجود أفكار تمس سلامتك الشخصية. صحتك وأمانك هما الأولوية القصوى. يُرجى التواصل الفوري مع خطوط الدعم المتخصصة المجانية:
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <a
                    href="tel:16328"
                    style={{
                      background: '#ef4444',
                      color: '#fff',
                      textDecoration: 'none',
                      padding: '7px 14px',
                      borderRadius: '8px',
                      fontSize: '0.84rem',
                      fontWeight: 600,
                    }}
                  >
                    📞 اتصل بـ 16328 (الأمانة العامة للصحة النفسية)
                  </a>
                  <a
                    href="tel:08008880700"
                    style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      color: '#fff',
                      textDecoration: 'none',
                      padding: '7px 14px',
                      borderRadius: '8px',
                      fontSize: '0.84rem',
                    }}
                  >
                    📞 08008880700
                  </a>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                type="button"
                onClick={handleDiscussWithAI}
                className="auth-submit-btn"
                style={{ background: 'var(--accent)' }}
              >
                💬 مناقشة هذه النتيجة مع Stress AI للحصول على خطة
              </button>

              <button
                type="button"
                onClick={handleExport}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '0.86rem',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transition: 'background 0.15s ease',
                }}
              >
                📄 تصدير تقرير إكلينيكي مفصل للمعالج النفسي
              </button>

              <button
                type="button"
                onClick={() => handleReset(activeTest)}
                style={{
                  background: 'transparent',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-muted)',
                  padding: '9px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                }}
              >
                إعادة الاختبار من جديد
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
