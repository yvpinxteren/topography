import creditsScreen from '../features/credits/screens/creditsScreen.html?raw'
import exitDialog from '../features/game/screens/exitDialog.html?raw'
import { renderGameScreen } from '../features/game/gameComponent'
import highScoresScreen from '../features/high-scores/screens/highScoresScreen.html?raw'
import menuScreen from './screens/menuScreen.html?raw'
import newGameScreen from '../features/game/screens/newGameScreen.html?raw'
import settingsScreen from '../features/settings/screens/settingsScreen.html?raw'

export function renderApp(root: HTMLElement): void {
  root.innerHTML = [
    menuScreen,
    newGameScreen,
    renderGameScreen(),
    highScoresScreen,
    settingsScreen,
    creditsScreen,
    exitDialog,
  ].join('\n')
}
