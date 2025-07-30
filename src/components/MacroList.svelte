<script lang="ts">
  import { macroStore, type Macro } from '../stores/macroStore'

  let selectedMacro: Macro | null = null
  let isPlaying = false

  function playMacro(macro: Macro) {
    if (isPlaying) return

    isPlaying = true
    selectedMacro = macro

    // Content script에 매크로 실행 메시지 전송
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { 
          type: 'PLAY_MACRO',
          macro: macro
        })
      }
    })

    // 매크로 사용 시간 업데이트
    macroStore.update(macro.id, { lastUsed: new Date() })
    chrome.storage.sync.get('macros', (result) => {
      const macros = result.macros || []
      const updatedMacros = macros.map((m: Macro) => 
        m.id === macro.id ? { ...m, lastUsed: new Date() } : m
      )
      chrome.storage.sync.set({ macros: updatedMacros })
    })
  }

  function deleteMacro(macro: Macro) {
    if (confirm(`"${macro.name}" 매크로를 삭제하시겠습니까?`)) {
      macroStore.remove(macro.id)
      chrome.storage.sync.get('macros', (result) => {
        const macros = result.macros || []
        const filteredMacros = macros.filter((m: Macro) => m.id !== macro.id)
        chrome.storage.sync.set({ macros: filteredMacros })
      })
    }
  }

  // Content script로부터 매크로 실행 완료 메시지 수신
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'MACRO_COMPLETED') {
      isPlaying = false
      selectedMacro = null
    }
  })

  function formatDate(date: Date) {
    return new Date(date).toLocaleDateString('ko-KR')
  }
</script>

<div class="box">
  <h3 class="title is-5">
    <i class="fas fa-list"></i>
    저장된 매크로
  </h3>

  {#if $macroStore.length === 0}
    <div class="notification is-light">
      <span class="icon">
        <i class="fas fa-info-circle"></i>
      </span>
      <span>저장된 매크로가 없습니다. 새로운 매크로를 녹화해보세요.</span>
    </div>
  {:else}
    <div class="macro-list">
      {#each $macroStore as macro (macro.id)}
        <div class="box macro-item">
          <div class="level">
            <div class="level-left">
              <div class="level-item">
                <div>
                  <h4 class="title is-6">{macro.name}</h4>
                  {#if macro.description}
                    <p class="subtitle is-7">{macro.description}</p>
                  {/if}
                  <p class="is-size-7 has-text-grey">
                    생성: {formatDate(macro.createdAt)}
                    {#if macro.lastUsed}
                      | 마지막 사용: {formatDate(macro.lastUsed)}
                    {/if}
                  </p>
                </div>
              </div>
            </div>
            <div class="level-right">
              <div class="level-item">
                <div class="buttons are-small">
                  <button 
                    class="button is-success" 
                    on:click={() => playMacro(macro)}
                    disabled={isPlaying}
                  >
                    <span class="icon">
                      <i class="fas fa-play"></i>
                    </span>
                  </button>
                  <button 
                    class="button is-danger" 
                    on:click={() => deleteMacro(macro)}
                  >
                    <span class="icon">
                      <i class="fas fa-trash"></i>
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .box {
    margin-bottom: 1rem;
  }
  
  .title {
    margin-bottom: 1rem;
  }
  
  .macro-list {
    max-height: 200px;
    overflow-y: auto;
  }
  
  .macro-item {
    margin-bottom: 0.5rem;
    padding: 0.75rem;
  }
  
  .macro-item:last-child {
    margin-bottom: 0;
  }
</style> 