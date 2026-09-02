/**
 * Storage & Analytics Service for daily mood logs.
 */

export const MOOD_STORAGE_KEY = 'stress_ai_mood_logs'

export const MOOD_LEVELS = [
  { level: 1, emoji: '😫', label: 'إرهاق شديد', color: '#ef4444' },
  { level: 2, emoji: '😟', label: 'قلق وتوتر', color: '#f97316' },
  { level: 3, emoji: '😐', label: 'مستقر / هادئ', color: '#eab308' },
  { level: 4, emoji: '🙂', label: 'جيد وإيجابي', color: '#84cc16' },
  { level: 5, emoji: '😊', label: 'مرتاح ومبتهج', color: '#22c55e' },
]

export function loadMoodLogs() {
  try {
    const raw = localStorage.getItem(MOOD_STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveMoodLogs(logs) {
  try {
    localStorage.setItem(MOOD_STORAGE_KEY, JSON.stringify(logs))
  } catch (error) {
    console.warn('Failed to persist mood logs:', error)
  }
}

export function recordMoodEntry(existingLogs, { level, note }) {
  const todayStr = new Date().toISOString().slice(0, 10)
  const newEntry = {
    id: Date.now(),
    level,
    note: note.trim(),
    dateStr: todayStr,
    displayDate: new Date().toLocaleDateString('ar-EG', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    }),
  }

  const filtered = existingLogs.filter((m) => m.dateStr !== todayStr)
  const updated = [newEntry, ...filtered].slice(0, 30)
  saveMoodLogs(updated)
  return updated
}

export function calculateAverageMood(logs) {
  if (!logs || logs.length === 0) return null
  const total = logs.reduce((acc, cur) => acc + cur.level, 0)
  return (total / logs.length).toFixed(1)
}
