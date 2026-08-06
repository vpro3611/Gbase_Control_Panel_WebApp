<template>
  <div class="modal-overlay">
    <div class="modal-content glass-card">
      <h3 class="modal-title">{{ title }}</h3>
      <p class="modal-subtitle">{{ subtitle }}</p>

      <div class="otp-container">
        <input
          v-for="(digit, index) in digits"
          :key="index"
          :ref="el => inputRefs[index] = el as HTMLInputElement"
          v-model="digits[index]"
          type="text"
          maxlength="1"
          class="otp-box"
          @input="onInput(index)"
          @keydown.delete="onDelete(index)"
        />
      </div>

      <div v-if="error" class="error-banner">{{ error }}</div>

      <div class="modal-actions">
        <button class="btn btn-secondary" @click="$emit('close')">Cancel</button>
        <button class="btn btn-primary" :disabled="isSubmitting" @click="submit">
          {{ isSubmitting ? 'Verifying...' : 'Verify OTP' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const props = defineProps<{
  title: string;
  subtitle: string;
}>();

const emit = defineEmits(['submit', 'close']);

const digits = ref(['', '', '', '', '', '']);
const inputRefs = ref<HTMLInputElement[]>([]);
const error = ref('');
const isSubmitting = ref(false);

onMounted(() => {
  if (inputRefs.value[0]) {
    inputRefs.value[0].focus();
  }
});

function onInput(index: number) {
  error.value = '';
  if (digits.value[index] && index < 5) {
    inputRefs.value[index + 1]?.focus();
  }
}

function onDelete(index: number) {
  if (!digits.value[index] && index > 0) {
    inputRefs.value[index - 1]?.focus();
  }
}

function submit() {
  const code = digits.value.join('');
  if (code.length !== 6) {
    error.value = 'Please enter all 6 digits of the OTP code';
    return;
  }
  emit('submit', code);
}
</script>

<style scoped>
.modal-title {
  font-size: 1.3rem;
  margin-bottom: 6px;
  color: var(--text-main);
}

.modal-subtitle {
  font-size: 0.9rem;
  color: var(--text-muted);
  margin-bottom: 24px;
}

.otp-container {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 20px;
}

.otp-box {
  width: 48px;
  height: 56px;
  text-align: center;
  font-size: 1.5rem;
  font-weight: 700;
  font-family: var(--font-mono);
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  color: var(--primary);
  transition: all var(--transition-fast);
}

.otp-box:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 15px rgba(56, 189, 248, 0.4);
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
}
</style>
