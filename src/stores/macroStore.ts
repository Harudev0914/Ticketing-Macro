import { writable } from 'svelte/store'

export interface Macro {
  id: string
  name: string
  description: string
  actions: MacroAction[]
  createdAt: Date
  lastUsed?: Date
}

export interface MacroAction {
  type: 'click' | 'input' | 'wait' | 'scroll' | 'keypress'
  selector?: string
  value?: string
  delay?: number
  x?: number
  y?: number
}

function createMacroStore() {
  const { subscribe, set, update } = writable<Macro[]>([])

  return {
    subscribe,
    set,
    add: (macro: Macro) => update(macros => [...macros, macro]),
    remove: (id: string) => update(macros => macros.filter(m => m.id !== id)),
    update: (id: string, macro: Partial<Macro>) => update(macros => 
      macros.map(m => m.id === id ? { ...m, ...macro } : m)
    ),
    clear: () => set([])
  }
}

export const macroStore = createMacroStore() 