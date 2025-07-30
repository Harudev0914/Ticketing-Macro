<script lang="ts">
  import { settingsStore } from '../stores/settingsStore'

  function updateSetting(key: string, value: any) {
    settingsStore.update({ [key]: value })
    chrome.storage.sync.set({ [key]: value })
  }
</script>

<div class="box">
  <h3 class="title is-5">
    <i class="fas fa-cog"></i>
    설정
  </h3>

  <div class="field">
    <label class="checkbox">
      <input 
        type="checkbox" 
        bind:checked={$settingsStore.autoDetect}
        on:change={() => updateSetting('autoDetect', $settingsStore.autoDetect)}
      >
      자동 감지 활성화
    </label>
    <p class="help">페이지 로드 시 자동으로 티켓팅 사이트를 감지합니다.</p>
  </div>

  <div class="field">
    <label class="label">녹화 속도</label>
    <div class="control">
      <div class="select">
        <select 
          bind:value={$settingsStore.recordingSpeed}
          on:change={() => updateSetting('recordingSpeed', $settingsStore.recordingSpeed)}
        >
          <option value={0.5}>0.5x (느리게)</option>
          <option value={1}>1x (보통)</option>
          <option value={1.5}>1.5x (빠르게)</option>
          <option value={2}>2x (매우 빠르게)</option>
        </select>
      </div>
    </div>
  </div>

  <div class="field">
    <label class="label">재생 속도</label>
    <div class="control">
      <div class="select">
        <select 
          bind:value={$settingsStore.playbackSpeed}
          on:change={() => updateSetting('playbackSpeed', $settingsStore.playbackSpeed)}
        >
          <option value={0.5}>0.5x (느리게)</option>
          <option value={1}>1x (보통)</option>
          <option value={1.5}>1.5x (빠르게)</option>
          <option value={2}>2x (매우 빠르게)</option>
        </select>
      </div>
    </div>
  </div>

  <div class="field">
    <div class="control">
      <button 
        class="button is-info is-small"
        on:click={() => chrome.runtime.openOptionsPage()}
      >
        <span class="icon">
          <i class="fas fa-external-link-alt"></i>
        </span>
        <span>고급 설정</span>
      </button>
    </div>
  </div>
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
  
  .help {
    font-size: 0.75rem;
    color: #666;
    margin-top: 0.25rem;
  }
</style> 