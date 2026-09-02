/**
 * Assessment Calculator Service.
 * Implements standard psychiatric scoring algorithms and severity interpretations.
 */

const SEVERITY_RULES = {
  gad7: (total) => {
    if (total <= 4) {
      return {
        level: 'قلق ضئيل / طبيعي (Minimal Anxiety)',
        color: '#22c55e',
        advice: 'أعراضك في الحدود الطبيعية. استمر في عاداتك الصحية والنوم المنتظم.',
      }
    }
    if (total <= 9) {
      return {
        level: 'قلق خفيف (Mild Anxiety)',
        color: '#eab308',
        advice: 'يوجد قلق خفيف. تمارين التنفس (4-7-8) واليقظة الذهنية كافية لتهدئتك.',
      }
    }
    if (total <= 14) {
      return {
        level: 'قلق متوسط (Moderate Anxiety)',
        color: '#f97316',
        advice: 'القلق يؤثر على يومك. نوصي بتطبيق تقنيات العلاج المعرفي السلوكي (CBT) والتحدث لمختص.',
      }
    }
    return {
      level: 'قلق حاد ومكثف (Severe Anxiety)',
      color: '#ef4444',
      advice: 'تختبر ضغطاً نفسياً حاداً. ننصحك باستشارة طبيب نفسي مرخص لمساندتك فوراً.',
    }
  },

  isi: (total) => {
    if (total <= 4) {
      return {
        level: 'نوم صحي ومستقر (No Insomnia)',
        color: '#22c55e',
        advice: 'كفاءة نومك ممتازة، حافظ على مواعيد استيقاظك الثابتة.',
      }
    }
    if (total <= 8) {
      return {
        level: 'أرق طفيف / عابر (Subthreshold Insomnia)',
        color: '#eab308',
        advice: 'جرب إبعاد الشاشات الزرقاء قبل النوم بساعة وتقليل الكافيين.',
      }
    }
    return {
      level: 'أرق سريري يحتاج لتدخل (Clinical Insomnia)',
      color: '#ef4444',
      advice: 'جودة نومك منخفضة وتؤثر على صحتك. بروتوكول CBT-I هو الحل الأمثل لك.',
    }
  },

  phq9: (total) => {
    if (total <= 4) {
      return {
        level: 'لا يوجد اكتئاب / أعراض ضئيلة (Minimal)',
        color: '#22c55e',
        advice: 'أعراضك في النطاق الطبيعي المستقر، حافظ على توازنك اليومي.',
      }
    }
    if (total <= 9) {
      return {
        level: 'أعراض اكتئابية خفيفة (Mild Depression)',
        color: '#eab308',
        advice: 'تختبر إرهاقاً نفسياً خفيفاً. نوصي بالتنشيط السلوكي والرياضة وتمارين الاسترخاء.',
      }
    }
    if (total <= 14) {
      return {
        level: 'اكتئاب متوسط الشدة (Moderate Depression)',
        color: '#f97316',
        advice: 'الأعراض تعيق روتينك اليومي. نوصي بمراجعة معالج نفسي مختص بجلسات CBT.',
      }
    }
    if (total <= 19) {
      return {
        level: 'اكتئاب متوسط إلى شديد (Moderately Severe)',
        color: '#ea580c',
        advice: 'تحتاج إلى دعم نفسي منظم ومتخصص لمساندتك على تجاوز هذه الفترة.',
      }
    }
    return {
      level: 'اكتئاب حاد سريري (Severe Depression)',
      color: '#ef4444',
      advice: 'حالة إكلينيكية تستوجب التدخل الفوري من طبيب نفسي مرخص.',
    }
  },
}

/**
 * Calculates assessment total score and severity diagnosis.
 *
 * @param {string} testId
 * @param {Record<number, number>} answers
 * @param {number} totalQuestions
 * @returns {{ totalScore: number, answeredCount: number, isComplete: boolean, severity: object }}
 */
export function calculateAssessmentResult(testId, answers, totalQuestions) {
  const answeredCount = Object.keys(answers).length
  const totalScore = Object.values(answers).reduce((acc, score) => acc + score, 0)
  const isComplete = answeredCount === totalQuestions

  const ruleFn = SEVERITY_RULES[testId] || SEVERITY_RULES.gad7
  const severity = ruleFn(totalScore)

  return {
    totalScore,
    answeredCount,
    isComplete,
    severity,
  }
}
