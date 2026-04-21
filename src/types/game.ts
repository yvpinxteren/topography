export interface City {
  name: string
  x: number
  y: number
  level: number
}

export interface GameState {
  mapX: number
  mapY: number
  keysPressed: Record<string, boolean>
  timeRemaining: number
  points: number
  targetCity: City | null
  gameActive: boolean
  countdownActive: boolean
}

export interface GameUiActions {
  showMenuScreen: () => void
  showHighScoresScreen: () => void
  showExitDialog: () => void
  hideExitDialog: () => void
  showGameOverDialog: (score: number) => void
  hideGameOverDialog: () => void
}
