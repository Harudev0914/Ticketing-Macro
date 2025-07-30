import { writable } from 'svelte/store'

export interface Settings {
  isEnabled: boolean
  autoDetect: boolean
  recordingSpeed: number
  playbackSpeed: number
}

function createSettingsStore() {
  const { subscribe, set, update } = writable<Settings>({
    isEnabled: true,
    autoDetect: true,
    recordingSpeed: 1,
    playbackSpeed: 1
  })

  return {
    subscribe,
    set,
    update: (settings: Partial<Settings>) => update(current => ({ ...current, ...settings }))
  }
}

export const settingsStore = createSettingsStore() 