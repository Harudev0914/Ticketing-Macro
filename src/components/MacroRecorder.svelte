<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import { macroStore, type Macro, type MacroAction } from '../stores/macroStore'

  const dispatch = createEventDispatcher()

  let isRecording = false
  let recordingName = ''
  let recordingDescription = ''

  function startRecording() {
    if (!recordingName.trim()) {
      alert('매크로 이름을 입력해주세요.')
      return
    }

    isRecording = true
    dispatch('recordingStarted')
    
    // Content script에 녹화 시작 메시지 전송
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { 
          type: 'START_RECORDING',
          macroName: recordingName
        })
      }
    })
  }

  function stopRecording() {
    isRecording = false
    dispatch('recordingStopped')
    
    // Content script에 녹화 중지 메시지 전송
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'STOP_RECORDING' })
      }
    })
  }

  function saveMacro(actions: MacroAction[]) {
    const macro: Macro = {
      id: Date.now().toString(),
      name: recordingName,
      description: recordingDescription,
      actions,
      createdAt: new Date()
    }

    macroStore.add(macro)
    
    // Chrome storage에 저장
    chrome.storage.sync.get('macros', (result) => {
      const macros = result.macros || []
      macros.push(macro)
      chrome.storage.sync.set({ macros })
    })

    recordingName = ''
    recordingDescription = ''
  }

  // Content script로부터 녹화된 액션 수신
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'RECORDED_ACTIONS' && isRecording) {
      saveMacro(message.actions)
      isRecording = false
      dispatch('recordingStopped')
    }
  })
</script>

<div class="box">
  <h3 class="title is-5">
    <i class="fas fa-microphone"></i>
    매크로 녹화
  </h3>

  {#if !isRecording}
    <div class="field">
      <label class="label">매크로 이름</label>
      <div class="control">
        <input 
          class="input" 
          type="text" 
          placeholder="매크로 이름을 입력하세요"
          bind:value={recordingName}
        >
      </div>
    </div>

    <div class="field">
      <label class="label">설명 (선택사항)</label>
      <div class="control">
        <textarea 
          class="textarea" 
          placeholder="매크로에 대한 설명을 입력하세요"
          bind:value={recordingDescription}
        ></textarea>
      </div>
    </div>

    <div class="field">
      <div class="control">
        <button 
          class="button is-success" 
          on:click={startRecording}
          disabled={!recordingName.trim()}
        >
          <span class="icon">
            <i class="fas fa-record-vinyl"></i>
          </span>
          <span>녹화 시작</span>
        </button>
      </div>
    </div>
  {:else}
    <div class="notification is-warning is-light">
      <span class="icon">
        <i class="fas fa-record-vinyl"></i>
      </span>
      <span>녹화 중... 페이지에서 마우스 클릭과 키보드 입력을 기록합니다.</span>
    </div>

    <div class="field">
      <div class="control">
        <button class="button is-danger" on:click={stopRecording}>
          <span class="icon">
            <i class="fas fa-stop"></i>
          </span>
          <span>녹화 중지</span>
        </button>
      </div>
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
  
  .field {
    margin-bottom: 1rem;
  }
</style> 