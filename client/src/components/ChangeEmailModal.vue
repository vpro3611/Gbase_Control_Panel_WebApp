<template>
  <div class="modal-overlay">
    <div class="modal-content glass-card">
      <h3>Change Account Email</h3>
      <p class="modal-desc">Enter your new email address. A 6-digit OTP code will be sent to verify.</p>

      <form v-if="step === 'email'" @submit.prevent="requestOtp">
        <div class="form-group">
          <label>New Email Address</label>
          <input
            v-model="newEmail"
            type="email"
            required
            placeholder="newemail@example.com"
            class="form-input"
          />
        </div>

        <div v-if="error" class="error-banner">{{ error }}</div>

        <div class="modal-actions">
          <button type="button" class="btn btn-secondary" @click="$emit('close')">Cancel</button>
          <button type="submit" class="btn btn-primary" :disabled="loading">
            {{ loading ? 'Sending OTP...' : 'Send OTP Code' }}
          </button>
        </div>
      </form>

      <div v-else class="otp-step">
        <OtpModal
          title="Verify New Email"
          :subtitle="`Enter the 6-digit OTP code sent to ${newEmail}`"
          @submit="verifyOtp"
          @close="$emit('close')"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { api } from '../services/api';
import OtpModal from './OtpModal.vue';

const emit = defineEmits(['close', 'updated']);

const step = ref<'email' | 'otp'>('email');
const newEmail = ref('');
const error = ref('');
const loading = ref(false);

async function requestOtp() {
  error.value = '';
  loading.value = true;
  try {
    await api.changeEmail(newEmail.value);
    step.value = 'otp';
  } catch (err: any) {
    error.value = err.message || 'Failed to request email change';
  } finally {
    loading.value = false;
  }
}

async function verifyOtp(code: string) {
  try {
    await api.verifyChangeEmail(newEmail.value, code);
    emit('updated', newEmail.value);
    emit('close');
  } catch (err: any) {
    error.value = err.message || 'Verification failed';
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
