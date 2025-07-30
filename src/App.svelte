<script lang="ts">
  import { onMount } from 'svelte'
  import MacroRecorder from './components/MacroRecorder.svelte'
  import MacroList from './components/MacroList.svelte'
  import Settings from './components/Settings.svelte'
  import Login from './components/Login.svelte'
  import { macroStore } from './stores/macroStore'
  import { settingsStore } from './stores/settingsStore'

  let isEnabled = true
  let currentTab = null
  let isLoggedIn = false
  let isLoading = true

  onMount(async () => {
    // 로그인 상태 확인
    const auth = await chrome.storage.sync.get(['isLoggedIn', 'userToken'])
    isLoggedIn = auth.isLoggedIn === true && auth.userToken
    
    if (!isLoggedIn) {
      isLoading = false
      return
    }

    // 현재 활성 탭 가져오기
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    currentTab = tab

    // 저장된 설정 로드
    const settings = await chrome.storage.sync.get(['isEnabled', 'autoDetect'])
    isEnabled = settings.isEnabled !== false
    settingsStore.set({
      autoDetect: settings.autoDetect !== false,
      isEnabled
    })

    // 저장된 매크로 로드
    const macros = await chrome.storage.sync.get('macros')
    if (macros.macros) {
      macroStore.set(macros.macros)
    }

    isLoading = false
  })

  function toggleEnabled() {
    isEnabled = !isEnabled
    settingsStore.update(settings => ({ ...settings, isEnabled }))
    chrome.storage.sync.set({ isEnabled })
  }

  function handleLoginSuccess() {
    isLoggedIn = true
    chrome.storage.sync.set({ isLoggedIn: true })
  }
</script>

{#if isLoading}
  <div class="container" style="width: 350px; min-height: 400px; padding: 16px; display: flex; align-items: center; justify-content: center;">
    <div class="box">
      <div class="has-text-centered">
        <i class="fas fa-spinner fa-spin fa-2x"></i>
        <p class="mt-3">로딩 중...</p>
      </div>
    </div>
  </div>
{:else if !isLoggedIn}
  <Login on:loginSuccess={handleLoginSuccess} />
{:else}
  <main class="container" style="width: 350px; min-height: 400px; padding: 16px;">
    <div class="box">
      <div class="level">
        <div class="level-left">
          <div class="level-item">
            <h1 class="title is-4">
              <i class="fas fa-ticket-alt"></i>
              Ticketing Macro
            </h1>
          </div>
        </div>
        <div class="level-right">
          <div class="level-item">
            <div class="field">
              <input 
                id="toggleEnabled" 
                type="checkbox" 
                class="is-checkradio is-success" 
                bind:checked={isEnabled}
                on:change={toggleEnabled}
              >
              <label for="toggleEnabled">
                <span class="icon is-small">
                  <i class="fas fa-{isEnabled ? 'check' : 'times'}"></i>
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div class="notification is-{isEnabled ? 'success' : 'danger'} is-light">
        <span class="icon">
          <i class="fas fa-{isEnabled ? 'play' : 'pause'}"></i>
        </span>
        <span>{isEnabled ? '활성화됨' : '비활성화됨'}</span>
      </div>

      <MacroRecorder />
      <MacroList />
      <Settings />
    </div>
  </main>
{/if}

<style>
  :global(body) {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }
  
  .container {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
  }
  
  .box {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border: none;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  }
  
  .title {
    color: #363636;
    margin-bottom: 0;
  }
  
  .notification {
    margin-bottom: 1rem;
  }
</style> 