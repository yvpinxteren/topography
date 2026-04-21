export interface GameSettings {
  moveSpeed: number
  startTimeSeconds: number
  timeBonusSeconds: number
}
export const gameSettings: GameSettings = {
  moveSpeed: 12,
  startTimeSeconds: 180,
  timeBonusSeconds: 5,
}

interface InitializeGameSettingsOptions {
  onStartTimeChange?: (value: number) => void
}

export function initializeGameSettings(options: InitializeGameSettingsOptions = {}): void {
  const speedSlider = document.getElementById('speed-slider') as HTMLInputElement | null
  const speedValue = document.getElementById('speed-value')
  const timeBonusSlider = document.getElementById('time-bonus-slider') as HTMLInputElement | null
  const timeBonusValue = document.getElementById('time-bonus-value')
  const startTimeSlider = document.getElementById('start-time-slider') as HTMLInputElement | null
  const startTimeValue = document.getElementById('start-time-value')

  bindSliderSetting(speedSlider, speedValue, gameSettings.moveSpeed, (value) => {
    gameSettings.moveSpeed = value
  })

  bindSliderSetting(timeBonusSlider, timeBonusValue, gameSettings.timeBonusSeconds, (value) => {
    gameSettings.timeBonusSeconds = value
  })

  bindSliderSetting(startTimeSlider, startTimeValue, gameSettings.startTimeSeconds, (value) => {
    gameSettings.startTimeSeconds = value
    options.onStartTimeChange?.(value)
  })
}

function bindSliderSetting(
  slider: HTMLInputElement | null,
  valueElement: Element | null,
  initialValue: number,
  onChange: (value: number) => void,
): void {
  if (!slider || !valueElement) {
    return
  }

  slider.value = initialValue.toString()
  valueElement.textContent = initialValue.toString()

  slider.addEventListener('input', (event) => {
    const value = parseInt((event.target as HTMLInputElement).value, 10)
    onChange(value)
    valueElement.textContent = value.toString()
  })
}
