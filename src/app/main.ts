import '../styles/style.css'
import { exitGameToMenu, initializeGameUi, startGameNetherlands, syncIdleStartTime } from '../features/game/game'
import { addHighScore, renderHighScores } from '../features/high-scores/highScores'
import { initializeGameSettings } from '../features/settings/settings'
import { renderApp } from './layout'

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
}

const app = document.getElementById('app') as HTMLElement
renderApp(app)

type ScreenName = 'menu' | 'newGame' | 'gameNetherlands' | 'highScores' | 'settings' | 'credits'

const screens: Record<ScreenName, HTMLElement> = {
  menu: document.getElementById('menu-screen') as HTMLElement,
  newGame: document.getElementById('new-game-screen') as HTMLElement,
  gameNetherlands: document.getElementById('game-netherlands-screen') as HTMLElement,
  highScores: document.getElementById('high-scores-screen') as HTMLElement,
  settings: document.getElementById('settings-screen') as HTMLElement,
  credits: document.getElementById('credits-screen') as HTMLElement,
}

const gameOverDialog = document.getElementById('game-over-dialog') as HTMLElement | null
const gameOverScoreValue = document.getElementById('game-over-score-value') as HTMLElement | null
const gameOverNameInput = document.getElementById('game-over-name') as HTMLInputElement | null
const highScoresList = document.getElementById('high-scores-list') as HTMLElement | null

let pendingGameOverScore = 0

export function showScreen(screen: ScreenName): void {
  Object.values(screens).forEach((element) => {
    element.hidden = true
  })

  screens[screen].hidden = false
}

function renderHighScoresScreen(): void {
  if (highScoresList) {
    renderHighScores(highScoresList)
  }
}

function showHighScoresScreen(): void {
  renderHighScoresScreen()
  showScreen('highScores')
}

initializeGameUi({
  showMenuScreen: () => showScreen('menu'),
  showHighScoresScreen,
  showExitDialog,
  hideExitDialog,
  showGameOverDialog,
  hideGameOverDialog,
})

function setupNavigation(): void {
  initializeGameSettings({
    onStartTimeChange: syncIdleStartTime,
  })

  document.getElementById('btn-new-game')?.addEventListener('click', () => showScreen('newGame'))
  document.getElementById('btn-high-scores')?.addEventListener('click', () => showHighScoresScreen())
  document.getElementById('btn-settings')?.addEventListener('click', () => showScreen('settings'))
  document.getElementById('btn-credits')?.addEventListener('click', () => showScreen('credits'))

  document.getElementById('btn-map-netherlands')?.addEventListener('click', () => {
    showScreen('gameNetherlands')
    startGameNetherlands()
  })
  document.getElementById('btn-map-europe')?.addEventListener('click', () => {
    console.log('Selected: Europa')
  })
  document.getElementById('btn-map-world')?.addEventListener('click', () => {
    console.log('Selected: Wereld')
  })

  document.querySelectorAll('.btn-back').forEach((button) => {
    button.addEventListener('click', () => showScreen('menu'))
  })

  document.getElementById('btn-exit-yes')?.addEventListener('click', () => {
    exitGameToMenu()
  })
  document.getElementById('btn-exit-no')?.addEventListener('click', () => {
    hideExitDialog()
  })

  document.getElementById('btn-game-over-confirm')?.addEventListener('click', submitHighScore)
  gameOverNameInput?.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      submitHighScore()
    }
  })

  document.addEventListener('keydown', (event) => {
    const currentScreen = Object.values(screens).find((screen) => !screen.hidden)
    if (event.key === 'Escape' && currentScreen && currentScreen.id !== 'game-netherlands-screen') {
      showScreen('menu')
    }
  })
}

function showExitDialog(): void {
  const exitDialog = document.getElementById('exit-dialog') as HTMLElement | null
  if (exitDialog) {
    exitDialog.hidden = false
  }
}

function hideExitDialog(): void {
  const exitDialog = document.getElementById('exit-dialog') as HTMLElement | null
  if (exitDialog) {
    exitDialog.hidden = true
  }
}

function showGameOverDialog(score: number): void {
  pendingGameOverScore = score

  if (gameOverScoreValue) {
    gameOverScoreValue.textContent = score.toString()
  }

  if (gameOverNameInput) {
    gameOverNameInput.value = ''
  }

  if (gameOverDialog) {
    gameOverDialog.hidden = false
  }

  window.setTimeout(() => {
    gameOverNameInput?.focus()
  }, 0)
}

function hideGameOverDialog(): void {
  if (gameOverDialog) {
    gameOverDialog.hidden = true
  }
}

function submitHighScore(): void {
  addHighScore(gameOverNameInput?.value ?? 'PLAYER', pendingGameOverScore)
  hideGameOverDialog()
  showHighScoresScreen()
}

async function setupServiceWorker(): Promise<void> {
  if (!('serviceWorker' in navigator)) {
    return
  }

  if (import.meta.env.DEV) {
    const registrations = await navigator.serviceWorker.getRegistrations()
    await Promise.all(registrations.map((registration) => registration.unregister()))

    if ('caches' in window) {
      const cacheNames = await caches.keys()
      await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)))
    }

    return
  }

  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}service-worker.js`).catch((error) => {
      console.log('Service Worker registration failed:', error)
    })
  })
}

function setupPwaDebug(): void {
  const params = new URLSearchParams(window.location.search)
  const shouldShowDebug = params.get('pwa-debug') === '1'

  const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    || ('standalone' in navigator && Boolean((navigator as Navigator & { standalone?: boolean }).standalone))

  const logPrefix = '[PWA Debug]'
  console.log(`${logPrefix} standalone mode:`, isStandalone)

  if (!shouldShowDebug) {
    window.addEventListener('beforeinstallprompt', () => {
      console.log(`${logPrefix} beforeinstallprompt fired`)
    })

    window.addEventListener('appinstalled', () => {
      console.log(`${logPrefix} appinstalled fired`)
    })

    return
  }

  const indicator = document.createElement('div')
  indicator.setAttribute('aria-live', 'polite')
  indicator.style.position = 'fixed'
  indicator.style.left = '12px'
  indicator.style.bottom = '12px'
  indicator.style.zIndex = '9999'
  indicator.style.maxWidth = 'min(70vw, 280px)'
  indicator.style.padding = '10px 12px'
  indicator.style.border = '1px solid rgba(0, 255, 0, 0.45)'
  indicator.style.borderRadius = '10px'
  indicator.style.background = 'rgba(0, 0, 0, 0.82)'
  indicator.style.color = '#9cff9c'
  indicator.style.font = '12px/1.4 monospace'
  indicator.style.boxShadow = '0 0 18px rgba(0, 0, 0, 0.35)'
  indicator.style.backdropFilter = 'blur(4px)'
  document.body.append(indicator)

  const setIndicatorText = (message: string): void => {
    indicator.textContent = `PWA: ${message}`
    console.log(`${logPrefix} ${message}`)
  }

  setIndicatorText(isStandalone ? 'standalone geopend' : 'wachten op install-signaal')

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then(() => {
        setIndicatorText(isStandalone ? 'standalone + sw gereed' : 'service worker gereed')
      })
      .catch(() => {
        setIndicatorText('service worker niet gereed')
      })
  } else {
    setIndicatorText('service worker niet ondersteund')
  }

  window.addEventListener('beforeinstallprompt', () => {
    setIndicatorText('installable: beforeinstallprompt ontvangen')
  })

  window.addEventListener('appinstalled', () => {
    setIndicatorText('app geïnstalleerd')
  })

  window.matchMedia('(display-mode: standalone)').addEventListener('change', (event) => {
    if (event.matches) {
      setIndicatorText('standalone geopend')
    }
  })
}

setupNavigation()
renderHighScoresScreen()
setupPwaDebug()
void setupServiceWorker()
showScreen('menu')
