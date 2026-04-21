import { gameSettings } from '../settings/settings'
import { getGameComponentElements } from './gameComponent'
import { createVirtualJoystick, DIRECTION_KEYS } from './virtualJoystick'
import type { City, GameState, GameUiActions } from '../../types/game'

// Game cities data
export const GAME_CITIES: City[] = [
  { name: "Amsterdam", x: 360, y: 550, level: 1 },
  { name: "Haarlem", x: 528, y: 580, level: 1 },
  { name: "Utrecht", x: 110, y: 10, level: 1 },
  { name: "Rotterdam", x: 543, y: -966, level: 1 },
  { name: "Den Haag", x: 790, y: -643, level: 1 },
  { name: "Leiden", x: 655, y: -380, level: 1 },
  { name: "Delft", x: 674, y: -733, level: 1 },
  { name: "Almere", x: 223, y: 879, level: 1 },
  { name: "Lelystad", x: -344, y: 820, level: 1 },
  { name: "Zwolle", x: -479, y: 1327, level: 1 },
  { name: "Groningen", x: -1039, y: 3385, level: 1 },
  { name: "Leeuwarden", x: -189, y: 3626, level: 1 },
  { name: "Assen", x: -862, y: 2841, level: 1 },
  { name: "Arnhem", x: -751, y: -1, level: 1 },
  { name: "Nijmegen", x: -930, y: -590, level: 1 },
  { name: "Apeldoorn", x: -497, y: 630, level: 1 },
  { name: "Enschede", x: -1338, y: 469, level: 1 },
  { name: "Deventer", x: -612, y: 842, level: 1 },
  { name: "Den Bosch", x: -140, y: -1212, level: 1 },
  { name: "Eindhoven", x: -466, y: -1808, level: 1 },
  { name: "Tilburg", x: -98, y: -1824, level: 1 },
  { name: "Breda", x: 680, y: -1130, level: 1 },
  { name: "Maastricht", x: -696, y: -2654, level: 1 },
  { name: "Middelburg", x: 1674, y: -1537, level: 1 },
  { name: "Goes", x: 1310, y: -1175, level: 1 }
]

// Game state
export let gameState: GameState = {
  mapX: 0,
  mapY: 0,
  keysPressed: {} as Record<string, boolean>,
  timeRemaining: 180, // 3 minutes
  points: 0,
  targetCity: null as typeof GAME_CITIES[0] | null,
  gameActive: false,
  countdownActive: false,
}

const TARGET_REACH_DISTANCE = 32

let activeAnimationId: number | null = null
let activeTimerInterval: number | null = null
let activeCountdownInterval: number | null = null
let activeCountdownTimeout: number | null = null
let removeGameControls: (() => void) | null = null
let gameUiActions: GameUiActions | null = null
const keyboardDirectionState = createDirectionState()
const joystickDirectionState = createDirectionState()

type DirectionKey = typeof DIRECTION_KEYS[number]

function createDirectionState(): Record<DirectionKey, boolean> {
  return {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
  }
}

function syncDirectionalInputs(): void {
  DIRECTION_KEYS.forEach((direction) => {
    gameState.keysPressed[direction] = keyboardDirectionState[direction] || joystickDirectionState[direction]
  })
}

function resetDirectionalInputs(): void {
  DIRECTION_KEYS.forEach((direction) => {
    keyboardDirectionState[direction] = false
    joystickDirectionState[direction] = false
    gameState.keysPressed[direction] = false
  })
}

function setKeyboardDirection(direction: DirectionKey, isPressed: boolean): void {
  keyboardDirectionState[direction] = isPressed
  syncDirectionalInputs()
}

function setJoystickDirections(nextState: Record<DirectionKey, boolean>): void {
  DIRECTION_KEYS.forEach((direction) => {
    joystickDirectionState[direction] = nextState[direction]
  })
  syncDirectionalInputs()
}

function resetJoystickDirections(): void {
  setJoystickDirections(createDirectionState())
}

export function initializeGameUi(actions: GameUiActions): void {
  gameUiActions = actions
  updateGameHUD()
}

export function selectRandomCity(): void {
  const availableCities = GAME_CITIES.filter((city) => city !== gameState.targetCity)
  const cityPool = availableCities.length > 0 ? availableCities : GAME_CITIES
  const randomIndex = Math.floor(Math.random() * cityPool.length)
  gameState.targetCity = cityPool[randomIndex]
  updateGameHUD()
}

export function startGameNetherlands(): void {
  window.setTimeout(() => {
    const gameComponent = getGameComponentElements()

    if (!gameComponent) {
      console.error('Game elements not found')
      return
    }

    cleanupCurrentGame()

    gameState.mapX = 0
    gameState.mapY = 0
    gameState.keysPressed = createDirectionState()
    resetDirectionalInputs()
    gameState.timeRemaining = gameSettings.startTimeSeconds
    gameState.points = 0
    gameState.targetCity = null
    gameState.gameActive = false
    gameState.countdownActive = true
    resetGameView(gameComponent.map, gameComponent.countdownOverlay)
    setupGameControls(gameComponent.map)

    selectRandomCity()
    showCountdown(gameComponent.countdownOverlay, gameComponent.map)
  }, 0)
}

export function showCountdown(countdownOverlay: HTMLElement, mapElement: HTMLImageElement): void {
  const countdownText = getGameComponentElements()?.countdownText
  if (!countdownText) return
  
  let count = 3
  
  activeCountdownInterval = window.setInterval(() => {
    if (count > 0) {
      countdownText.textContent = count.toString()
      count--
    } else {
      countdownText.textContent = 'START'
      activeCountdownTimeout = window.setTimeout(() => {
        countdownOverlay.style.display = 'none'
        gameState.gameActive = true
        gameState.countdownActive = false
        startGameTimer()
      }, 500)
      if (activeCountdownInterval !== null) {
        clearInterval(activeCountdownInterval)
        activeCountdownInterval = null
      }
    }
  }, 1000)
}

export function startGameTimer(): void {
  activeTimerInterval = window.setInterval(() => {
    if (gameState.gameActive && gameState.timeRemaining > 0) {
      gameState.timeRemaining--
      updateGameHUD()
      
      if (gameState.timeRemaining === 0) {
        gameState.gameActive = false
        if (activeTimerInterval !== null) {
          clearInterval(activeTimerInterval)
          activeTimerInterval = null
        }
        endGame()
      }
    } else if (!gameState.gameActive) {
      if (activeTimerInterval !== null) {
        clearInterval(activeTimerInterval)
        activeTimerInterval = null
      }
    }
  }, 1000)
}

export function endGame(): void {
  console.log(`Game Over! Final Points: ${gameState.points}`)
  exitGameToMenu()
}

export function updateGameHUD(): void {
  const gameComponent = getGameComponentElements()
  const hudPoints = gameComponent?.hudPoints
  const hudTarget = gameComponent?.hudTarget
  const hudTime = gameComponent?.hudTime

  if (hudPoints) hudPoints.textContent = gameState.points.toString()
  if (hudTarget) hudTarget.textContent = gameState.targetCity?.name.toUpperCase() || '---'

  if (hudTime) {
    const minutes = Math.floor(gameState.timeRemaining / 60)
    const seconds = gameState.timeRemaining % 60
    hudTime.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`
  }
  updateCoordinateDisplay()
  updateTargetMarkerPosition()
}

export function setupGameControls(mapElement: HTMLImageElement): void {
  const gameComponent = getGameComponentElements()

  // Track key presses
  const handleKeyDown = (event: KeyboardEvent) => {
    // Handle Escape key for exit confirmation
    if (event.key === 'Escape') {
      event.preventDefault()
      gameUiActions?.showExitDialog()
      return
    }

    if (DIRECTION_KEYS.includes(event.key as DirectionKey)) {
      event.preventDefault()
      setKeyboardDirection(event.key as DirectionKey, true)
    }
  }

  const handleKeyUp = (event: KeyboardEvent) => {
    if (DIRECTION_KEYS.includes(event.key as DirectionKey)) {
      setKeyboardDirection(event.key as DirectionKey, false)
    }
  }

  // Add event listeners
  document.addEventListener('keydown', handleKeyDown)
  document.addEventListener('keyup', handleKeyUp)
  const teardownJoystick = gameComponent
    ? createVirtualJoystick({
        elements: {
          joystick: gameComponent.joystick,
          joystickThumb: gameComponent.joystickThumb,
        },
        onDirectionChange: setJoystickDirections,
      })
    : resetJoystickDirections

  // Map boundaries - calculate dynamically based on viewport size
  const MAP_WIDTH = 5632 //1024x5.5
  const MAP_HEIGHT = 8448 //1536x5.5
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight

  // Allow full movement to edges - calculate how much we can move
  // The map should always fill the screen, so max offset is when map edge touches screen edge
  const MAX_OFFSET_X = Math.max(0, (MAP_WIDTH - viewportWidth) / 2)
  const MAX_OFFSET_Y = Math.max(0, (MAP_HEIGHT - viewportHeight) / 2)

  console.log(`Viewport: ${viewportWidth}x${viewportHeight}, Max offsets: X=${MAX_OFFSET_X}, Y=${MAX_OFFSET_Y}`)

  const gameLoop = (): void => {
    if (gameState.gameActive) {
      // Update map position based on arrow keys
      if (gameState.keysPressed['ArrowUp']) {
        gameState.mapY += gameSettings.moveSpeed
      }
      if (gameState.keysPressed['ArrowDown']) {
        gameState.mapY -= gameSettings.moveSpeed
      }
      if (gameState.keysPressed['ArrowLeft']) {
        gameState.mapX += gameSettings.moveSpeed
      }
      if (gameState.keysPressed['ArrowRight']) {
        gameState.mapX -= gameSettings.moveSpeed
      }

      // Limit map boundaries - prevent flying off the map
      gameState.mapX = Math.max(-MAX_OFFSET_X, Math.min(MAX_OFFSET_X, gameState.mapX))
      gameState.mapY = Math.max(-MAX_OFFSET_Y, Math.min(MAX_OFFSET_Y, gameState.mapY))

      // Apply transform to map - use translate with percentage offsets
      const translateX = gameState.mapX
      const translateY = gameState.mapY
      mapElement.style.transform = `translate(calc(-50% + ${translateX}px), calc(-50% + ${translateY}px))`

      checkTargetReached()
      updateGameHUD()
    }

    // Continue animation loop
    activeAnimationId = requestAnimationFrame(gameLoop)
  }

  removeGameControls = () => {
    document.removeEventListener('keydown', handleKeyDown)
    document.removeEventListener('keyup', handleKeyUp)
    teardownJoystick()
  }

  // Start game loop
  gameLoop()

}

function resetGameView(mapElement: HTMLImageElement, countdownOverlay: HTMLElement): void {
  mapElement.style.transform = 'translate(-50%, -50%)'
  countdownOverlay.style.display = 'flex'
  const countdownText = getGameComponentElements()?.countdownText
  if (countdownText) {
    countdownText.textContent = '3'
  }
  gameUiActions?.hideExitDialog()
  updateGameHUD()
}

function updateCoordinateDisplay(): void {
  const coordinateLines = getGameComponentElements()?.coordinateLines

  if (!coordinateLines || coordinateLines.length < 2) return

  coordinateLines[0].textContent = `X: ${Math.round(gameState.mapX)}`
  coordinateLines[1].textContent = `Y: ${Math.round(gameState.mapY)}`
}

function updateTargetMarkerPosition(): void {
  const targetMarker = getGameComponentElements()?.targetMarker ?? null

  if (!targetMarker || !gameState.targetCity) {
    if (targetMarker) {
      targetMarker.hidden = true
    }
    return
  }

  // City coordinates are stored as the map offsets needed to center that city.
  // Invert them here to place the marker at the matching on-screen map position.
  const markerX = -gameState.targetCity.x + gameState.mapX
  const markerY = -gameState.targetCity.y + gameState.mapY

  targetMarker.hidden = false
  targetMarker.style.transform = `translate(calc(-50% + ${markerX}px), calc(-50% + ${markerY}px))`
}

function checkTargetReached(): void {
  const gameComponent = getGameComponentElements()
  const helicopter = gameComponent?.helicopter ?? null
  const targetMarker = gameComponent?.targetMarker ?? null

  if (!gameState.targetCity || !helicopter || !targetMarker || targetMarker.hidden) {
    return
  }

  const helicopterRect = helicopter.getBoundingClientRect()
  const targetRect = targetMarker.getBoundingClientRect()

  const helicopterCenterX = helicopterRect.left + helicopterRect.width / 2
  const helicopterCenterY = helicopterRect.top + helicopterRect.height / 2
  const targetCenterX = targetRect.left + targetRect.width / 2
  const targetCenterY = targetRect.top + targetRect.height / 2

  const distance = Math.hypot(targetCenterX - helicopterCenterX, targetCenterY - helicopterCenterY)

  if (distance <= TARGET_REACH_DISTANCE) {
    gameState.points += 1
    gameState.timeRemaining += gameSettings.timeBonusSeconds
    selectRandomCity()
  }
}

export function syncIdleStartTime(value: number): void {
  if (!gameState.gameActive && !gameState.countdownActive) {
    gameState.timeRemaining = value
    updateGameHUD()
  }
}

export function exitGameToMenu(): void {
  cleanupCurrentGame()
  gameUiActions?.showMenuScreen()
}

function cleanupCurrentGame(): void {
  gameState.gameActive = false
  gameState.countdownActive = false
  resetDirectionalInputs()

  if (activeAnimationId !== null) {
    cancelAnimationFrame(activeAnimationId)
    activeAnimationId = null
  }

  if (activeTimerInterval !== null) {
    clearInterval(activeTimerInterval)
    activeTimerInterval = null
  }

  if (activeCountdownInterval !== null) {
    clearInterval(activeCountdownInterval)
    activeCountdownInterval = null
  }

  if (activeCountdownTimeout !== null) {
    clearTimeout(activeCountdownTimeout)
    activeCountdownTimeout = null
  }

  if (removeGameControls) {
    removeGameControls()
    removeGameControls = null
  }

  gameUiActions?.hideExitDialog()
}
