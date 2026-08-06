<template>
  <header class="navbar glass-card">
    <div class="brand">
      <div class="logo-icon">⚡</div>
      <div class="brand-text">
        <span class="title">GObase</span>
        <span class="subtitle">CONTROL PANEL</span>
      </div>
    </div>

    <div v-if="user" class="user-controls">
      <div class="user-chip">
        <span class="user-icon">👤</span>
        <span class="user-email">{{ user.email }}</span>
      </div>
      <button class="btn btn-secondary btn-sm" @click="$emit('open-change-email')">
        Change Email
      </button>
      <button class="btn btn-secondary btn-sm" @click="$emit('open-change-password')">
        Change Password
      </button>
      <button class="btn btn-secondary btn-sm logout-btn" @click="$emit('logout')">
        Logout
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
defineProps<{
  user: { id: string; email: string; isVerified: boolean } | null;
}>();

defineEmits(['logout', 'open-change-email', 'open-change-password']);
</script>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 32px;
  margin-bottom: 32px;
  border-radius: 0 0 16px 16px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  font-size: 24px;
  background: linear-gradient(135deg, #38bdf8 0%, #8b5cf6 100%);
  width: 42px;
  height: 42px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 15px rgba(56, 189, 248, 0.4);
}

.brand-text .title {
  font-family: var(--font-heading);
  font-size: 1.4rem;
  font-weight: 800;
  letter-spacing: 1px;
  color: var(--text-main);
  display: block;
  line-height: 1;
}

.brand-text .subtitle {
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 2px;
  color: var(--primary);
}

.user-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-chip {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.04);
  padding: 8px 14px;
  border-radius: 20px;
  border: 1px solid var(--border-color);
  font-size: 0.88rem;
}

.logout-btn:hover {
  background: rgba(239, 68, 68, 0.2);
  border-color: var(--danger);
  color: var(--danger);
}
</style>
