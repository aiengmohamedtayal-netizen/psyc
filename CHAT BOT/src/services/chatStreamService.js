/**
 * Service to manage Server-Sent Events (SSE) token streaming from the NLP/LLM
 * prediction endpoint with automatic HTTP fallback.
 */

import { API_BASE_URL } from './authApi.js'

const BACKEND_UNREACHABLE_MSG_AR =
  'عذراً، لم أتمكن من الاتصال بالخادم. يرجى التأكد من تشغيل الباك إند على المنفذ 8000.'
const BACKEND_UNREACHABLE_MSG_EN =
  "Sorry, I couldn't connect to the backend server. Please make sure FastAPI is running on port 8000."

/**
 * Returns localized connection error message based on input text script.
 * @param {string} text
 * @returns {string}
 */
export function getLocalizedErrorMessage(text) {
  const isArabic = /[\u0600-\u06FF]/.test(text)
  return isArabic ? BACKEND_UNREACHABLE_MSG_AR : BACKEND_UNREACHABLE_MSG_EN
}

/**
 * Streams tokens from the prediction endpoint.
 *
 * @param {object} params
 * @param {string} params.text
 * @param {string} [params.topic]
 * @param {Array<{ role: string, content: string }>} [params.history]
 * @param {AbortSignal} [params.signal]
 * @param {(delta: string) => void} params.onDelta
 * @param {(meta: object) => void} params.onMeta
 * @returns {Promise<{ content: string, enhanced_by_ai: boolean, clinical_reference: any }>}
 */
export async function streamPrediction({
  text,
  topic = '',
  history = [],
  signal,
  onDelta,
  onMeta,
}) {
  const payload = {
    text: text.trim(),
    topic: topic || '',
    history: history.slice(-6).map((item) => ({
      role: item.role,
      content: item.content,
    })),
  }

  try {
    const response = await fetch(`${API_BASE_URL}/predict/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal,
    })

    if (!response.ok || !response.body) {
      throw new Error(`Streaming failed with HTTP status: ${response.status}`)
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder('utf-8')
    let accumulatedText = ''
    let buffer = ''
    let wasEnhanced = true
    let clinicalRef = null

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        const trimmedLine = line.trim()
        if (!trimmedLine.startsWith('data: ')) continue

        const dataStr = trimmedLine.replace(/^data:\s*/, '').trim()
        if (dataStr === '[DONE]') break

        try {
          const parsed = JSON.parse(dataStr)
          if (parsed.delta) {
            accumulatedText += parsed.delta
            if (onDelta) onDelta(accumulatedText)
          } else if (parsed.meta) {
            if (typeof parsed.meta.enhanced_by_ai === 'boolean') {
              wasEnhanced = parsed.meta.enhanced_by_ai
            }
            if (parsed.meta.clinical_reference) {
              clinicalRef = parsed.meta.clinical_reference
            }
            if (onMeta) onMeta(parsed.meta)
          }
        } catch {
          // ignore malformed chunk
        }
      }
    }

    return {
      content: accumulatedText || 'I am here to support you.',
      enhanced_by_ai: wasEnhanced,
      clinical_reference: clinicalRef,
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      throw error
    }

    // Attempt non-streaming fallback endpoint
    return await requestFallbackPrediction(payload)
  }
}

/**
 * Fallback to standard non-streaming HTTP endpoint if SSE fails.
 * @param {object} payload
 * @returns {Promise<{ content: string, enhanced_by_ai: boolean, clinical_reference: any }>}
 */
async function requestFallbackPrediction(payload) {
  try {
    const response = await fetch(`${API_BASE_URL}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      throw new Error(`Fallback failed with status ${response.status}`)
    }

    const data = await response.json()
    return {
      content: data.prediction,
      enhanced_by_ai: data.enhanced_by_ai ?? false,
      clinical_reference: data.clinical_reference || null,
    }
  } catch {
    return {
      content: getLocalizedErrorMessage(payload.text),
      enhanced_by_ai: false,
      clinical_reference: null,
    }
  }
}
