/**
 * Storage and Sound Effects Service for the Worry Dump Box.
 */

export const WORRY_STORAGE_KEY = 'stress_ai_worry_notes'

export function loadWorryNotes() {
  try {
    const data = localStorage.getItem(WORRY_STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export function saveWorryNotes(notes) {
  try {
    localStorage.setItem(WORRY_STORAGE_KEY, JSON.stringify(notes))
  } catch (error) {
    console.warn('Failed to save worry notes:', error)
  }
}

export function createWorryNote(existingNotes, text) {
  const clean = text.trim()
  if (!clean) return existingNotes

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

  const updated = [newNote, ...existingNotes]
  saveWorryNotes(updated)
  return updated
}

export function deleteWorryNote(existingNotes, id) {
  const updated = existingNotes.filter((note) => note.id !== id)
  saveWorryNotes(updated)
  return updated
}

/**
 * Synthesizes a subtle burning/crepitus audio effect using Web Audio API.
 */
export function playBurnSfx() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()
    const bufferSize = Math.floor(ctx.sampleRate * 0.9)
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.35
    }

    const noise = ctx.createBufferSource()
    noise.buffer = buffer

    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(350, ctx.currentTime)
    filter.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.85)

    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.25, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.85)

    noise.connect(filter)
    filter.connect(gain)
    gain.connect(ctx.destination)
    noise.start()
  } catch {
    // ignore audio synthesis error
  }
}
