// Content script for Ticketing Macro extension

interface MacroAction {
  type: 'click' | 'input' | 'wait' | 'scroll' | 'keypress'
  selector?: string
  value?: string
  delay?: number
  x?: number
  y?: number
}

interface Macro {
  id: string
  name: string
  description: string
  actions: MacroAction[]
  createdAt: Date
  lastUsed?: Date
}

let isRecording = false
let recordedActions: MacroAction[] = []
let currentMacro: Macro | null = null

// 이벤트 리스너들
let clickListener: ((e: MouseEvent) => void) | null = null
let inputListener: ((e: Event) => void) | null = null
let keyListener: ((e: KeyboardEvent) => void) | null = null

// 매크로 녹화 시작
function startRecording(macroName: string) {
  isRecording = true
  recordedActions = []
  currentMacro = {
    id: Date.now().toString(),
    name: macroName,
    description: '',
    actions: [],
    createdAt: new Date()
  }

  // 클릭 이벤트 리스너
  clickListener = (e: MouseEvent) => {
    if (!isRecording) return

    const target = e.target as HTMLElement
    const selector = generateSelector(target)
    
    recordedActions.push({
      type: 'click',
      selector,
      x: e.clientX,
      y: e.clientY,
      delay: 100
    })
  }

  // 입력 이벤트 리스너
  inputListener = (e: Event) => {
    if (!isRecording) return

    const target = e.target as HTMLInputElement
    const selector = generateSelector(target)
    
    recordedActions.push({
      type: 'input',
      selector,
      value: target.value,
      delay: 50
    })
  }

  // 키보드 이벤트 리스너
  keyListener = (e: KeyboardEvent) => {
    if (!isRecording) return

    recordedActions.push({
      type: 'keypress',
      value: e.key,
      delay: 50
    })
  }

  document.addEventListener('click', clickListener, true)
  document.addEventListener('input', inputListener, true)
  document.addEventListener('keydown', keyListener, true)

  // 녹화 시작 알림
  showNotification('매크로 녹화가 시작되었습니다. 페이지에서 마우스 클릭과 키보드 입력을 기록합니다.', 'info')
}

// 매크로 녹화 중지
function stopRecording() {
  isRecording = false

  if (clickListener) {
    document.removeEventListener('click', clickListener, true)
    clickListener = null
  }
  if (inputListener) {
    document.removeEventListener('input', inputListener, true)
    inputListener = null
  }
  if (keyListener) {
    document.removeEventListener('keydown', keyListener, true)
    keyListener = null
  }

  if (currentMacro && recordedActions.length > 0) {
    currentMacro.actions = recordedActions
    chrome.runtime.sendMessage({
      type: 'RECORDED_ACTIONS',
      actions: recordedActions
    })
  }

  showNotification('매크로 녹화가 완료되었습니다.', 'success')
}

// 매크로 실행
async function executeMacro(macro: Macro) {
  showNotification(`${macro.name} 매크로를 실행합니다...`, 'info')

  for (const action of macro.actions) {
    try {
      await executeAction(action)
      await sleep(action.delay || 100)
    } catch (error) {
      console.error('매크로 실행 오류:', error)
      showNotification('매크로 실행 중 오류가 발생했습니다.', 'error')
      return
    }
  }

  chrome.runtime.sendMessage({ type: 'MACRO_COMPLETED' })
  showNotification(`${macro.name} 매크로 실행이 완료되었습니다.`, 'success')
}

// 액션 실행
async function executeAction(action: MacroAction): Promise<void> {
  switch (action.type) {
    case 'click':
      if (action.selector) {
        const element = document.querySelector(action.selector) as HTMLElement
        if (element) {
          element.click()
        }
      }
      break

    case 'input':
      if (action.selector && action.value !== undefined) {
        const element = document.querySelector(action.selector) as HTMLInputElement
        if (element) {
          element.value = action.value
          element.dispatchEvent(new Event('input', { bubbles: true }))
        }
      }
      break

    case 'keypress':
      if (action.value) {
        document.dispatchEvent(new KeyboardEvent('keydown', { key: action.value }))
      }
      break

    case 'wait':
      await sleep(action.delay || 1000)
      break

    case 'scroll':
      window.scrollTo(action.x || 0, action.y || 0)
      break
  }
}

// 셀렉터 생성
function generateSelector(element: HTMLElement): string {
  if (element.id) {
    return `#${element.id}`
  }
  
  if (element.className) {
    const classes = element.className.split(' ').filter(c => c.trim())
    if (classes.length > 0) {
      return `.${classes.join('.')}`
    }
  }

  return element.tagName.toLowerCase()
}

// 유틸리티 함수
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// 알림 표시
function showNotification(message: string, type: 'info' | 'success' | 'error' = 'info') {
  const notification = document.createElement('div')
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 16px;
    border-radius: 8px;
    color: white;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    z-index: 10000;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transition: all 0.3s ease;
  `

  switch (type) {
    case 'success':
      notification.style.backgroundColor = '#10b981'
      break
    case 'error':
      notification.style.backgroundColor = '#ef4444'
      break
    default:
      notification.style.backgroundColor = '#3b82f6'
  }

  notification.textContent = message
  document.body.appendChild(notification)

  setTimeout(() => {
    notification.style.opacity = '0'
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification)
      }
    }, 300)
  }, 3000)
}

// 메시지 리스너
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case 'START_RECORDING':
      startRecording(message.macroName)
      break

    case 'STOP_RECORDING':
      stopRecording()
      break

    case 'PLAY_MACRO':
      executeMacro(message.macro)
      break

    case 'TICKETING_SITE_DETECTED':
      showNotification('티켓팅 사이트가 감지되었습니다. 매크로를 사용할 수 있습니다.', 'info')
      break
  }
})

// 페이지 로드 완료 시 초기화
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    console.log('Ticketing Macro content script loaded')
  })
} else {
  console.log('Ticketing Macro content script loaded')
} 