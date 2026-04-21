const HIGH_SCORES_STORAGE_KEY = 'geochopper-high-scores'
const MAX_HIGH_SCORES = 10

export type HighScoreEntry = {
  name: string
  score: number
}

const defaultHighScores: HighScoreEntry[] = [
  { name: 'PLAYER ONE', score: 0 },
  { name: 'PLAYER TWO', score: 0 },
  { name: 'PLAYER THREE', score: 0 },
  { name: 'PLAYER FOUR', score: 0 },
  { name: 'PLAYER FIVE', score: 0 },
]

function sanitizeHighScores(input: unknown): HighScoreEntry[] {
  if (!Array.isArray(input)) {
    return defaultHighScores
  }

  const sanitizedEntries = input
    .map((entry) => {
      if (!entry || typeof entry !== 'object') {
        return null
      }

      const candidate = entry as Partial<HighScoreEntry>
      const name = typeof candidate.name === 'string' ? candidate.name.trim().toUpperCase() : ''
      const score = typeof candidate.score === 'number' ? Math.max(0, Math.floor(candidate.score)) : NaN

      if (!name || Number.isNaN(score)) {
        return null
      }

      return {
        name: name.slice(0, 14),
        score,
      }
    })
    .filter((entry): entry is HighScoreEntry => entry !== null)

  return sanitizedEntries.length > 0 ? sanitizedEntries : defaultHighScores
}

export function loadHighScores(): HighScoreEntry[] {
  try {
    const rawValue = window.localStorage.getItem(HIGH_SCORES_STORAGE_KEY)

    if (!rawValue) {
      return defaultHighScores
    }

    return sanitizeHighScores(JSON.parse(rawValue))
      .sort((left, right) => right.score - left.score)
      .slice(0, MAX_HIGH_SCORES)
  } catch {
    return defaultHighScores
  }
}

function saveHighScores(entries: HighScoreEntry[]): void {
  window.localStorage.setItem(HIGH_SCORES_STORAGE_KEY, JSON.stringify(entries))
}

export function ensureHighScores(): HighScoreEntry[] {
  const entries = loadHighScores()
  saveHighScores(entries)
  return entries
}

export function addHighScore(name: string, score: number): HighScoreEntry[] {
  const nextEntry: HighScoreEntry = {
    name: (name.trim() || 'PLAYER').toUpperCase().slice(0, 14),
    score: Math.max(0, Math.floor(score)),
  }

  const updatedEntries = [...loadHighScores(), nextEntry]
    .sort((left, right) => right.score - left.score)
    .slice(0, MAX_HIGH_SCORES)

  saveHighScores(updatedEntries)
  return updatedEntries
}

export function renderHighScores(container: HTMLElement): void {
  const entries = ensureHighScores()

  container.innerHTML = entries
    .map((entry, index) => (
      `<div class="high-score-row">`
      + `<span class="high-score-rank">${index + 1}.</span>`
      + `<span class="high-score-name">${entry.name}</span>`
      + `<span class="high-score-score">${entry.score}</span>`
      + `</div>`
    ))
    .join('')
}
