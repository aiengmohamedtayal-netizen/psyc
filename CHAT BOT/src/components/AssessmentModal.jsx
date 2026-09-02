import React, { useState } from 'react'

const ASSESSMENTS = {
  gad7: {
    title: 'مقياس القلق المعمم (GAD-7 Anxiety Scale)',
    description: 'المقياس المعتمد دولياً لتقييم حدة التوتر والقلق خلال الأسبوعين الماضيين.',
    questions: [
      'الشعور بالعصبية، القلق أو التوتر على حافة الانهيار؟',
      'عدم القدرة على إيقاف القلق أو السيطرة عليه؟',
      'القلق المفرط بشأن أمور مختلفة ومتعددة؟',
      'صعوبة في الاسترخاء والهدوء الجسدي؟',
      'الشعور بالتململ وعدم القدرة على الجلوس ساكناً؟',
      'الانزعاج السريع أو سرعة الغضب من أشياء بسيطة؟',
      'الشعور بالخوف كأن شيئاً مروعاً وكارثياً سيحدث؟',
    ],
    options: [
      { text: 'أبداً (Not at all)', score: 0 },
      { text: 'عدة أيام (Several days)', score: 1 },
      { text: 'أكثر من نصف الأيام (Half days)', score: 2 },
      { text: 'يومياً تقريباً (Nearly every day)', score: 3 },
    ],
    getSeverity: (total) => {
      if (total <= 4) return { level: 'قلق ضئيل / طبيعي (Minimal Anxiety)', color: '#22c55e', advice: 'أعراضك في الحدود الطبيعية. استمر في عاداتك الصحية والنوم المنتظم.' }
      if (total <= 9) return { level: 'قلق خفيف (Mild Anxiety)', color: '#eab308', advice: 'يوجد قلق خفيف. تمارين التنفس (4-7-8) واليقظة الذهنية كافية لتهدئتك.' }
      if (total <= 14) return { level: 'قلق متوسط (Moderate Anxiety)', color: '#f97316', advice: 'القلق يؤثر على يومك. نوصي بتطبيق تقنيات العلاج المعرفي السلوكي (CBT) والتحدث لمختص.' }
      return { level: 'قلق حاد ومكثف (Severe Anxiety)', color: '#ef4444', advice: 'تختبر ضغطاً نفسياً حاداً. ننصحك باستشارة طبيب نفسي مرخص لمساندتك فوراً.' }
    },
  },
  isi: {
    title: 'مقياس شدة الأرق واضطرابات النوم (ISI Index)',
    description: 'مقياس الأكاديمية الأمريكية لطب النوم لتقييم كفاءة وجودة النوم.',
    questions: [
      'صعوبة في بدء النوم والنعاس عند الذهاب للفراش؟',
      'الاستيقاظ المتكرر أثناء الليل وصعوبة العودة للنوم؟',
      'الاستيقاظ مبكراً جداً في الصباح والشعور بالإجهاد؟',
      'مدى عدم رضاك عن نمط ونوعية نومك الحالية؟',
      'مدى تأثير قلة النوم على تركيزك وعملك ومزاجك اليومي؟',
    ],
    options: [
      { text: 'لا يوجد أبداً (None)', score: 0 },
      { text: 'خفيف (Mild)', score: 1 },
      { text: 'متوسط (Moderate)', score: 2 },
      { text: 'شديد جداً (Severe)', score: 3 },
    ],
    getSeverity: (total) => {
      if (total <= 4) return { level: 'نوم صحي ومستقر (No Insomnia)', color: '#22c55e', advice: 'كفاءة نومك ممتازة، حافظ على مواعيد استيقاظك الثابتة.' }
      if (total <= 8) return { level: 'أرق طفيف / عابر (Subthreshold Insomnia)', color: '#eab308', advice: 'جرب إبعاد الشاشات الزرقاء قبل النوم بساعة وتقليل الكافيين.' }
      return { level: 'أرق سريري يحتاج لتدخل (Clinical Insomnia)', color: '#ef4444', advice: 'جودة نومك منخفضة وتؤثر على صحتك. بروتوكول CBT-I هو الحل الأمثل لك.' }
    },
  },
}

export default function AssessmentModal({ isOpen, onClose, onStartChatWithResult }) {
  const [activeTest, setActiveTest] = useState('gad7')
  const [answers, setAnswers] = useState({})
  const [isSubmitted, setIsSubmitted] = useState(false)

  if (!isOpen) return null

  const currentTest = ASSESSMENTS[activeTest]
  const totalQuestions = currentTest.questions.length

  const handleSelectOption = (qIdx, score) => {
    setAnswers((prev) => ({ ...prev, [qIdx]: score }))
  }

  const answeredCount = Object.keys(answers).length
  const totalScore = Object.values(answers).reduce((a, b) => a + b, 0)
  const result = currentTest.getSeverity(totalScore)

  const handleReset = (testId) => {
    setActiveTest(testId)
    setAnswers({})
    setIsSubmitted(false)
  }

  const handleDiscussWithAI = () => {
    const promptText = `لقد قمت بإجراء فحص «${currentTest.title}»، وحصلت على مجموع درجات (${totalScore}/${totalQuestions * 3})، والنتيجة تشير إلى: «${result.level}». أرجو تقديم خطة إرشادية وتوجيه عملي لحالتي.`
    onClose()
    onStartChatWithResult(promptText, activeTest === 'isi' ? 'sleep' : 'anxiety')
  }

  return (
    <div className="search-modal-overlay" style={{ alignItems: 'center', paddingTop: 0 }}>
      <div className="search-modal-content" style={{ maxWidth: '560px', padding: '28px 24px', maxHeight: '85vh', position: 'relative' }}>
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

        <div style={{ textAlign: 'center', marginBottom: '18px' }}>
          <span style={{ fontSize: '2rem' }}>📝</span>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', color: '#fbf9f5', marginTop: '4px' }}>
            الفحوصات والمقاييس النفسية المقننة
          </h2>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            مقاييس طبية مقننة عالمياً لقياس حدة القلق وكفاءة النوم
          </p>
        </div>

        {/* Test Tabs */}
        <div className="auth-tabs" style={{ marginBottom: '18px' }}>
          <button
            className={`auth-tab ${activeTest === 'gad7' ? 'active' : ''}`}
            onClick={() => handleReset('gad7')}
          >
            مقياس القلق (GAD-7)
          </button>
          <button
            className={`auth-tab ${activeTest === 'isi' ? 'active' : ''}`}
            onClick={() => handleReset('isi')}
          >
            مقياس الأرق (ISI)
          </button>
        </div>

        {!isSubmitted ? (
          <div style={{ overflowY: 'auto', paddingRight: '4px', flex: 1 }}>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-subtle)', marginBottom: '14px', lineHeight: 1.5 }}>
              {currentTest.description} (تمت الإجابة على {answeredCount} من {totalQuestions})
            </p>

            {currentTest.questions.map((q, idx) => (
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
                  {idx + 1}. {q}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                  {currentTest.options.map((opt) => {
                    const isSelected = answers[idx] === opt.score
                    return (
                      <button
                        key={opt.score}
                        type="button"
                        onClick={() => handleSelectOption(idx, opt.score)}
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
                        {opt.text}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}

            <button
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
              {totalScore} <span style={{ fontSize: '1.1rem', color: 'var(--text-subtle)' }}>/ {totalQuestions * 3}</span>
            </div>

            <p style={{ fontSize: '0.92rem', color: 'var(--text-main)', lineHeight: 1.7, marginBottom: '24px', maxWidth: '420px', margin: '0 auto 24px' }}>
              {result.advice}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                onClick={handleDiscussWithAI}
                className="auth-submit-btn"
                style={{ background: 'var(--accent)' }}
              >
                💬 مناقشة هذه النتيجة مع Stress AI للحصول على خطة
              </button>

              <button
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
