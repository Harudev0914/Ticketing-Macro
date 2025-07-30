<script lang="ts">
  import { createEventDispatcher } from 'svelte'

  const dispatch = createEventDispatcher()

  let email = ''
  let password = ''
  let isLoading = false
  let errorMessage = ''

  async function handleLogin() {
    if (!email.trim() || !password.trim()) {
      errorMessage = '이메일과 비밀번호를 입력해주세요.'
      return
    }

    isLoading = true
    errorMessage = ''

    try {
      // 실제 로그인 API 호출 대신 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // 로그인 성공 시
      const userToken = 'mock_token_' + Date.now()
      await chrome.storage.sync.set({ 
        isLoggedIn: true, 
        userToken,
        userEmail: email
      })
      
      dispatch('loginSuccess')
    } catch (error) {
      errorMessage = '로그인에 실패했습니다. 다시 시도해주세요.'
    } finally {
      isLoading = false
    }
  }

  function handleKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      handleLogin()
    }
  }
</script>

<main class="container" style="width: 350px; min-height: 400px; padding: 16px;">
  <div class="box">
    <div class="has-text-centered mb-5">
      <h1 class="title is-3">
        <i class="fas fa-ticket-alt"></i>
        Ticketing Macro
      </h1>
      <p class="subtitle is-6">티켓팅 매크로 서비스에 로그인하세요</p>
    </div>

    {#if errorMessage}
      <div class="notification is-danger is-light">
        <span class="icon">
          <i class="fas fa-exclamation-triangle"></i>
        </span>
        <span>{errorMessage}</span>
      </div>
    {/if}

    <div class="field">
      <label class="label">이메일</label>
      <div class="control has-icons-left">
        <input 
          class="input" 
          type="email" 
          placeholder="이메일을 입력하세요"
          bind:value={email}
          on:keypress={handleKeyPress}
          disabled={isLoading}
        >
        <span class="icon is-small is-left">
          <i class="fas fa-envelope"></i>
        </span>
      </div>
    </div>

    <div class="field">
      <label class="label">비밀번호</label>
      <div class="control has-icons-left">
        <input 
          class="input" 
          type="password" 
          placeholder="비밀번호를 입력하세요"
          bind:value={password}
          on:keypress={handleKeyPress}
          disabled={isLoading}
        >
        <span class="icon is-small is-left">
          <i class="fas fa-lock"></i>
        </span>
      </div>
    </div>

    <div class="field">
      <div class="control">
        <button 
          class="button is-primary is-fullwidth" 
          on:click={handleLogin}
          disabled={isLoading}
        >
          {#if isLoading}
            <span class="icon">
              <i class="fas fa-spinner fa-spin"></i>
            </span>
            <span>로그인 중...</span>
          {:else}
            <span class="icon">
              <i class="fas fa-sign-in-alt"></i>
            </span>
            <span>로그인</span>
          {/if}
        </button>
      </div>
    </div>

    <div class="has-text-centered mt-4">
      <p class="is-size-7 has-text-grey">
        계정이 없으신가요? 
        <a href="#" class="has-text-primary">회원가입</a>
      </p>
    </div>

    <div class="has-text-centered mt-3">
      <p class="is-size-7 has-text-grey">
        <a href="#" class="has-text-primary">비밀번호 찾기</a>
      </p>
    </div>
  </div>
</main>

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
    margin-bottom: 0.5rem;
  }
  
  .subtitle {
    color: #666;
  }
  
  .notification {
    margin-bottom: 1rem;
  }
</style> 