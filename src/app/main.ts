import '../styles/style.css'
import { exitGameToMenu, initializeGameUi, startGameNetherlands, syncIdleStartTime } from '../features/game/game'
import { initializeGameSettings } from '../features/settings/settings'
import { renderApp } from './layout'

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

export function showScreen(screen: ScreenName): void {
  Object.values(screens).forEach((element) => {
    element.hidden = true
  })

  screens[screen].hidden = false
}

initializeGameUi({
  showMenuScreen: () => showScreen('menu'),
  showExitDialog,
  hideExitDialog,
})

function setupNavigation(): void {
  initializeGameSettings({
    onStartTimeChange: syncIdleStartTime,
  })

  document.getElementById('btn-new-game')?.addEventListener('click', () => showScreen('newGame'))
  document.getElementById('btn-high-scores')?.addEventListener('click', () => showScreen('highScores'))
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

setupNavigation()
void setupServiceWorker()
showScreen('menu')
