// Background script for Ticketing Macro extension

// 확장 프로그램 설치 시 초기 설정
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // 기본 설정 저장
    chrome.storage.sync.set({
      isEnabled: true,
      autoDetect: true,
      recordingSpeed: 1,
      playbackSpeed: 1,
      macros: []
    })
  }
})

// 팝업에서 메시지 수신
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case 'GET_TAB_INFO':
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        sendResponse({ tab: tabs[0] })
      })
      return true // 비동기 응답을 위해 true 반환

    case 'EXECUTE_MACRO':
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          chrome.tabs.sendMessage(tabs[0].id, {
            type: 'EXECUTE_MACRO',
            macro: message.macro
          })
        }
      })
      break

    case 'START_RECORDING':
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          chrome.tabs.sendMessage(tabs[0].id, {
            type: 'START_RECORDING',
            macroName: message.macroName
          })
        }
      })
      break

    case 'STOP_RECORDING':
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          chrome.tabs.sendMessage(tabs[0].id, {
            type: 'STOP_RECORDING'
          })
        }
      })
      break
  }
})

// 탭 업데이트 시 자동 감지
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    // 티켓팅 사이트 자동 감지
    const ticketingSites = [
      'interpark.com',
      'yes24.com',
      'ticketlink.co.kr',
      'auction.co.kr',
      'gmarket.co.kr',
      '11st.co.kr'
    ]

    const isTicketingSite = ticketingSites.some(site => 
      tab.url?.includes(site)
    )

    if (isTicketingSite) {
      chrome.storage.sync.get(['autoDetect', 'isEnabled'], (result) => {
        if (result.autoDetect && result.isEnabled) {
          chrome.tabs.sendMessage(tabId, {
            type: 'TICKETING_SITE_DETECTED',
            url: tab.url
          })
        }
      })
    }
  }
})

// OAuth 인증 처리 (필요시)
chrome.identity.onSignInChanged.addListener((account, signedIn) => {
  if (signedIn) {
    console.log('User signed in:', account)
  } else {
    console.log('User signed out')
  }
}) 