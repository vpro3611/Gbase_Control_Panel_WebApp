<template>
  <div class="auth-container">
    <div class="auth-box glass-card">
      <div class="auth-header">
        <div class="auth-logo-badge">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
        </div>
        <h2>Welcome to GObase</h2>
        <p>Manage isolated in-memory database containers seamlessly</p>
      </div>

      <div class="auth-tabs">
        <button
          :class="['tab-btn', { active: mode === 'signin' }]"
          @click="mode = 'signin'"
        >
          Sign In
        </button>
        <button
          :class="['tab-btn', { active: mode === 'signup' }]"
          @click="mode = 'signup'"
        >
          Sign Up
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="auth-form">
        <div class="form-group">
          <label>Email Address</label>
          <input
            v-model="email"
            type="email"
            required
            placeholder="you@example.com"
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label>Password</label>
          <input
            v-model="password"
            type="password"
            required
            placeholder="••••••••••••"
            class="form-input"
          />
        </div>

        <div v-if="errorMessage" class="error-alert">{{ errorMessage }}</div>

        <button type="submit" class="btn btn-primary submit-btn" :disabled="loading">
          {{ loading ? 'Processing...' : (mode === 'signin' ? 'Sign In' : 'Sign Up') }}
        </button>
      </form>

      <div class="divider">
        <span>OR CONTINUE WITH</span>
      </div>

      <div class="oauth-buttons">
        <button class="btn btn-secondary oauth-btn" :disabled="loading" @click="handleOAuth('google')">
          <svg class="icon" viewBox="0 0 24 24" width="18" height="18"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/></svg>
          Google
        </button>
        <button class="btn btn-secondary oauth-btn" :disabled="loading" @click="handleOAuth('github')">
          <svg class="icon" viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
          GitHub
        </button>
      </div>
    </div>

    <!-- OTP Modal for Sign Up verification -->
    <OtpModal
      v-if="showOtpModal"
      title="Verify Email Address"
      :subtitle="`Enter the 6-digit OTP code sent to ${email}`"
      @submit="handleOtpVerify"
      @close="showOtpModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { api, setAuthToken } from '../services/api';
import OtpModal from './OtpModal.vue';

const emit = defineEmits(['authenticated']);

const mode = ref<'signin' | 'signup'>('signin');
const email = ref('');
const password = ref('');
const errorMessage = ref('');
const loading = ref(false);
const showOtpModal = ref(false);

onMounted(async () => {
  // 1. Inject Google Identity Services JS SDK
  if (!document.getElementById('google-jssdk')) {
    const script = document.createElement('script');
    script.id = 'google-jssdk';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }

  // 2. Check if returning from GitHub OAuth redirect flow with ?code=...
  const urlParams = new URLSearchParams(window.location.search);
  const githubCode = urlParams.get('code');
  if (githubCode) {
    window.history.replaceState({}, document.title, window.location.pathname);
    loading.value = true;
    try {
      const res = await api.oauthLogin('github', githubCode);
      setAuthToken(res.token);
      emit('authenticated', res.user);
    } catch (err: any) {
      errorMessage.value = err.message || 'GitHub OAuth login failed';
    } finally {
      loading.value = false;
    }
  }
});

async function handleSubmit() {
  errorMessage.value = '';
  loading.value = true;

  try {
    if (mode.value === 'signup') {
      await api.register(email.value, password.value);
      showOtpModal.value = true;
    } else {
      const res = await api.login(email.value, password.value);
      setAuthToken(res.token);
      emit('authenticated', res.user);
    }
  } catch (err: any) {
    errorMessage.value = err.message || 'Authentication failed';
  } finally {
    loading.value = false;
  }
}

async function handleOtpVerify(code: string) {
  try {
    const res = await api.verifyRegister(email.value, code);
    showOtpModal.value = false;
    setAuthToken(res.token);
    emit('authenticated', res.user);
  } catch (err: any) {
    errorMessage.value = err.message || 'OTP Verification failed';
  }
}

async function handleOAuth(provider: 'google' | 'github') {
  errorMessage.value = '';
  try {
    const oauthConfig = await api.getOauthConfig();

    if (provider === 'google') {
      if (!oauthConfig.googleClientId) {
        errorMessage.value = 'Google Client ID is not set in environment variables.';
        return;
      }

      if (typeof (window as any).google?.accounts?.oauth2?.initTokenClient === 'function') {
        const tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
          client_id: oauthConfig.googleClientId,
          scope: 'email profile',
          callback: async (response: any) => {
            if (response.error) {
              errorMessage.value = `Google OAuth login cancelled: ${response.error}`;
              return;
            }
            loading.value = true;
            try {
              const res = await api.oauthLogin('google', response.access_token);
              setAuthToken(res.token);
              emit('authenticated', res.user);
            } catch (err: any) {
              errorMessage.value = err.message || 'Google OAuth authentication failed';
            } finally {
              loading.value = false;
            }
          },
        });
        tokenClient.requestAccessToken();
      } else {
        errorMessage.value = 'Google Identity Services SDK is initializing. Please try again in a moment.';
      }
    } else if (provider === 'github') {
      if (!oauthConfig.githubClientId || oauthConfig.githubClientId === 'mock_github_client_id') {
        errorMessage.value = 'GitHub Client ID is not configured in environment variables.';
        return;
      }
      const redirectUri = window.location.origin;
      window.location.href = `https://github.com/login/oauth/authorize?client_id=${oauthConfig.githubClientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=user:email`;
    }
  } catch (err: any) {
    errorMessage.value = err.message || 'Failed to initialize OAuth flow';
  }
}
</script>

<style scoped>
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 120px);
  padding: 20px;
}

.auth-box {
  width: 100%;
  max-width: 440px;
  padding: 40px 32px;
}

.auth-header {
  text-align: center;
  margin-bottom: 28px;
}

.auth-logo-badge {
  width: 56px;
  height: 56px;
  margin: 0 auto 16px;
  border-radius: var(--radius-md);
  background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%);
  color: #040914;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 25px var(--primary-glow);
}

.auth-header h2 {
  font-size: 1.6rem;
  font-weight: 800;
  color: #fff;
  margin-bottom: 6px;
}

.auth-header p {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.auth-tabs {
  display: flex;
  background: rgba(15, 23, 42, 0.6);
  padding: 4px;
  border-radius: var(--radius-sm);
  margin-bottom: 24px;
  border: 1px solid var(--border-color);
}

.tab-btn {
  flex: 1;
  padding: 10px;
  border: none;
  background: transparent;
  color: var(--text-muted);
  font-weight: 600;
  cursor: pointer;
  border-radius: 6px;
  transition: all var(--transition-fast);
}

.tab-btn.active {
  background: var(--bg-card-hover);
  color: var(--primary);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.submit-btn {
  width: 100%;
  margin-top: 8px;
}

.error-alert {
  color: var(--danger);
  background: rgba(239, 68, 68, 0.1);
  padding: 10px 14px;
  border-radius: var(--radius-sm);
  border: 1px solid rgba(239, 68, 68, 0.2);
  font-size: 0.85rem;
  margin-bottom: 16px;
  text-align: center;
}

.divider {
  display: flex;
  align-items: center;
  text-align: center;
  margin: 24px 0;
  color: var(--text-dim);
  font-size: 0.7rem;
  letter-spacing: 1px;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid var(--border-color);
}

.divider span {
  padding: 0 12px;
}

.oauth-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.oauth-btn {
  width: 100%;
  font-size: 0.88rem;
}
</style>
