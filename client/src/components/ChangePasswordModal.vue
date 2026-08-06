<template>
  <div class="modal-overlay">
    <div class="modal-content glass-card">
      <h3>Change Account Password</h3>
      <p class="modal-desc">Request a 6-digit OTP code sent to your registered email to update password.</p>

      <div v-if="step === 'init'" class="init-step">
        <p>A verification code will be sent to your account email address.</p>
        <div v-if="error" class="error-banner">{{ error }}</div>

        <div class="modal-actions">
          <button class="btn btn-secondary" @click="$emit('close')">Cancel</button>
          <button class="btn btn-primary" :disabled="loading" @click="requestOtp">
            {{ loading ? 'Sending OTP...' : 'Send 6-Digit OTP' }}
          </button>
        </div>
      </div>

      <div v-else class="form-step">
        <div class="form-group">
          <label>6-Digit OTP Code</label>
          <input
            v-model="otpCode"
            type="text"
            maxlength="6"
            placeholder="123456"
            class="form-input mono"
          />
        </div>

        <div class="form-group">
          <label>New Password</label>
          <input
            v-model="newPassword"
            type="password"
            placeholder="••••••••••••"
            class="form-input"
          />
        </div>

        <div v-if="error" class="error-banner">{{ error }}</div>

        <div class="modal-actions">
          <button class="btn btn-secondary" @click="$emit('close')">Cancel</button>
          <button class="btn btn-primary" :disabled="loading" @click="verifyPasswordChange">
            {{ loading ? 'Updating...' : 'Update Password' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { api } from '../services/api';

const emit = defineEmits(['close', 'success']);

const step = ref<'init' | 'form'>('init');
const otpCode = ref('');
const newPassword = ref('');
const error = ref('');
const loading = ref(false);

async function requestOtp() {
  error.value = '';
  loading.value = true;
  try {
    await api.changePassword();
    step.value = 'form';
  } catch (err: any) {
    error.value = err.message || 'Failed to send OTP code';
  } finally {
    loading.value = false;
  }
}

async function verifyPasswordChange() {
  if (otpCode.value.length !== 6) {
    error.value = 'Please enter a valid 6-digit OTP code';
    return;
  }
  if (!newPassword.value || newPassword.value.length < 6) {
    error.value = 'Password must be at least 6 characters long';
    return;
  }

  error.value = '';
  loading.value = true;
  try {
    await api.verifyChangePassword(otpCode.value, newPassword.value);
    emit('success');
    emit('close');
  } catch (err: any) {
    error.value = err.message || 'Password update failed';
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.modal-desc {
  font-size: 0.9rem;
  color: var(--text-muted);
  margin-bottom: 20px;
}
.error-banner {
  color: var(--danger);
  font-size: 0.85rem;
  margin-bottom: 16px;
  text-align: center;
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}
</style>
