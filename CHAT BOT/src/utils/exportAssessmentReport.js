/**
 * Utility to format and trigger download of a clinical assessment report in Markdown format.
 *
 * @param {object} params
 * @param {string} params.testTitle
 * @param {string} params.testId
 * @param {number} params.totalScore
 * @param {number} params.maxScore
 * @param {object} params.result
 * @param {string} params.result.level
 * @param {string} params.result.advice
 * @param {Array<string>} params.questions
 * @param {Record<number, number>} params.answers
 */
export function exportAssessmentReport({
  testTitle,
  testId,
  totalScore,
  maxScore,
  result,
  questions,
  answers,
}) {
  const dateStr = new Date().toLocaleDateString('ar-EG', { dateStyle: 'full' })

  const questionsDetail = questions
    .map((question, index) => `${index + 1}. ${question}\n   - الدرجة المحددة: ${answers[index] ?? 0} / 3`)
    .join('\n\n')

  const reportText = `# 📋 تقرير تقييم سريري معتمد (Clinical Assessment Report)
المنصة: Stress AI Helper
التاريخ: ${dateStr}
نوع الفحص: ${testTitle}

## 1. ملخص النتيجة:
- مجموع الدرجات: ${totalScore} من أصل ${maxScore}
- المستوى السريري: ${result.level}

## 2. الإرشادات الأولية:
${result.advice}

## 3. تفاصيل الأسئلة والإجابات:
${questionsDetail}

---
تنبيه سري: هذا التقرير للاستخدام الإكلينيكي والاسترشادي فقط، ولا يغني عن مراجعة الطبيب النفسي المختص.
`

  const blob = new Blob([reportText], { type: 'text/markdown;charset=utf-8' })
  const downloadUrl = URL.createObjectURL(blob)
  const anchorElement = document.createElement('a')

  anchorElement.href = downloadUrl
  anchorElement.download = `clinical_assessment_${testId}_${Date.now()}.md`
  document.body.appendChild(anchorElement)
  anchorElement.click()
  document.body.removeChild(anchorElement)
  URL.revokeObjectURL(downloadUrl)
}
