import mapNetherlandsUrl from '../../assets/map-nederland.png'
import gameScreenTemplate from './screens/gameScreen.html?raw'

const MAP_ASSET_TOKEN = '__MAP_NETHERLANDS_URL__'

type QueryParent = ParentNode & {
  querySelector<E extends Element = Element>(selectors: string): E | null
}

export type GameComponentElements = {
  screen: HTMLElement
  map: HTMLImageElement
  countdownOverlay: HTMLElement
  countdownText: HTMLElement
  targetMarker: HTMLElement
  crashExplosion: HTMLElement
  helicopter: HTMLElement
  joystick: HTMLElement
  joystickThumb: HTMLElement
  hudPoints: HTMLElement
  hudTarget: HTMLElement
  hudTime: HTMLElement
  coordinateLines: NodeListOf<HTMLSpanElement>
}

function queryRequiredElement<E extends Element>(root: QueryParent, selector: string): E | null {
  return root.querySelector<E>(selector)
}

export function renderGameScreen(): string {
  return gameScreenTemplate.replace(MAP_ASSET_TOKEN, mapNetherlandsUrl)
}

export function getGameComponentElements(root: QueryParent = document): GameComponentElements | null {
  const screen = queryRequiredElement<HTMLElement>(root, '#game-netherlands-screen')

  if (!screen) {
    return null
  }

  const map = queryRequiredElement<HTMLImageElement>(screen, '#map-netherlands')
  const countdownOverlay = queryRequiredElement<HTMLElement>(screen, '#countdown-overlay')
  const countdownText = queryRequiredElement<HTMLElement>(screen, '#countdown-text')
  const targetMarker = queryRequiredElement<HTMLElement>(screen, '#target-marker')
  const crashExplosion = queryRequiredElement<HTMLElement>(screen, '#crash-explosion')
  const helicopter = queryRequiredElement<HTMLElement>(screen, '.helicopter')
  const joystick = queryRequiredElement<HTMLElement>(screen, '#mobile-joystick')
  const joystickThumb = queryRequiredElement<HTMLElement>(screen, '#mobile-joystick-thumb')
  const hudPoints = queryRequiredElement<HTMLElement>(screen, '#hud-points')
  const hudTarget = queryRequiredElement<HTMLElement>(screen, '#hud-target')
  const hudTime = queryRequiredElement<HTMLElement>(screen, '#hud-time')

  if (!map || !countdownOverlay || !countdownText || !targetMarker || !crashExplosion || !helicopter || !joystick || !joystickThumb || !hudPoints || !hudTarget || !hudTime) {
    return null
  }

  return {
    screen,
    map,
    countdownOverlay,
    countdownText,
    targetMarker,
    crashExplosion,
    helicopter,
    joystick,
    joystickThumb,
    hudPoints,
    hudTarget,
    hudTime,
    coordinateLines: screen.querySelectorAll<HTMLSpanElement>('#game-coordinates span'),
  }
}
