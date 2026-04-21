import type { GameComponentElements } from './gameComponent'

const JOYSTICK_MAX_DISTANCE = 36
const JOYSTICK_DIRECTION_THRESHOLD = 10

export const DIRECTION_KEYS = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'] as const

export type DirectionKey = typeof DIRECTION_KEYS[number]
export type DirectionState = Record<DirectionKey, boolean>

type VirtualJoystickOptions = {
  elements: Pick<GameComponentElements, 'joystick' | 'joystickThumb'>
  onDirectionChange: (nextState: DirectionState) => void
}

function createDirectionState(): DirectionState {
  return {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
  }
}

export function createVirtualJoystick({ elements, onDirectionChange }: VirtualJoystickOptions): () => void {
  const { joystick, joystickThumb } = elements
  let activePointerId: number | null = null

  const resetThumb = (): void => {
    joystickThumb.style.transform = 'translate(-50%, -50%)'
  }

  const emitDirectionState = (nextState: DirectionState): void => {
    onDirectionChange(nextState)
  }

  const updateFromPointer = (clientX: number, clientY: number): void => {
    const bounds = joystick.getBoundingClientRect()
    const centerX = bounds.left + bounds.width / 2
    const centerY = bounds.top + bounds.height / 2
    const rawDeltaX = clientX - centerX
    const rawDeltaY = clientY - centerY
    const distance = Math.hypot(rawDeltaX, rawDeltaY)
    const clampedDistance = Math.min(distance, JOYSTICK_MAX_DISTANCE)
    const scale = distance === 0 ? 0 : clampedDistance / distance
    const knobX = rawDeltaX * scale
    const knobY = rawDeltaY * scale

    joystickThumb.style.transform = `translate(calc(-50% + ${knobX}px), calc(-50% + ${knobY}px))`

    emitDirectionState({
      ArrowUp: knobY < -JOYSTICK_DIRECTION_THRESHOLD,
      ArrowDown: knobY > JOYSTICK_DIRECTION_THRESHOLD,
      ArrowLeft: knobX < -JOYSTICK_DIRECTION_THRESHOLD,
      ArrowRight: knobX > JOYSTICK_DIRECTION_THRESHOLD,
    })
  }

  const releaseJoystick = (pointerId?: number): void => {
    if (pointerId !== undefined && activePointerId !== pointerId) {
      return
    }

    activePointerId = null
    resetThumb()
    emitDirectionState(createDirectionState())
  }

  const handlePointerDown = (event: PointerEvent): void => {
    activePointerId = event.pointerId
    joystick.setPointerCapture(event.pointerId)
    event.preventDefault()
    updateFromPointer(event.clientX, event.clientY)
  }

  const handlePointerMove = (event: PointerEvent): void => {
    if (event.pointerId !== activePointerId) {
      return
    }

    event.preventDefault()
    updateFromPointer(event.clientX, event.clientY)
  }

  const handlePointerEnd = (event: PointerEvent): void => {
    releaseJoystick(event.pointerId)
  }

  joystick.addEventListener('pointerdown', handlePointerDown)
  document.addEventListener('pointermove', handlePointerMove, { passive: false })
  document.addEventListener('pointerup', handlePointerEnd)
  document.addEventListener('pointercancel', handlePointerEnd)

  return () => {
    joystick.removeEventListener('pointerdown', handlePointerDown)
    document.removeEventListener('pointermove', handlePointerMove)
    document.removeEventListener('pointerup', handlePointerEnd)
    document.removeEventListener('pointercancel', handlePointerEnd)
    releaseJoystick()
  }
}
