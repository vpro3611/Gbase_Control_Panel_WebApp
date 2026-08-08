<template>
  <header class="navbar-wrapper">
    <div class="navbar-container glass-card">
      <div class="brand">
        <div class="logo-mark">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
        </div>
        <div class="brand-info">
          <span class="brand-title">GObase <span class="badge-pill">v1.0</span></span>
          <span class="brand-sub">CONTROL PANEL</span>
        </div>
      </div>

      <div class="system-status">
        <span class="status-indicator"></span>
        <span class="status-label">Operational</span>
      </div>

      <div v-if="user" class="user-controls">
        <div class="user-pill">
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          <span class="email">{{ user.email }}</span>
        </div>

        <button class="btn btn-secondary btn-sm" title="Change Email" @click="$emit('open-change-email')">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
          <span>Email</span>
        </button>

        <button class="btn btn-secondary btn-sm" title="Change Password" @click="$emit('open-change-password')">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          <span>Password</span>
        </button>

        <button class="btn btn-danger btn-sm logout-btn" title="Logout" @click="$emit('logout')">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          <span>Logout</span>
        </button>
      </div>
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
.navbar-wrapper {
  padding: 16px 24px;
  margin-bottom: 32px;
}

.navbar-container {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 28px;
  border-radius: var(--radius-md);
  background: rgba(15, 23, 42, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.brand {
  display: flex;
  align-items: center;
  gap: 14px;
}

.logo-mark {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%);
  color: #040914;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 20px var(--primary-glow);
}

.brand-title {
  font-size: 1.35rem;
  font-weight: 800;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 8px;
  line-height: 1.1;
}

.badge-pill {
  font-size: 0.65rem;
  font-weight: 700;
  background: rgba(56, 189, 248, 0.15);
  color: var(--primary);
  border: 1px solid rgba(56, 189, 248, 0.3);
  padding: 2px 6px;
  border-radius: 6px;
}

.brand-sub {
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.15em;
  color: var(--text-muted);
}

.system-status {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.25);
  padding: 5px 14px;
  border-radius: var(--radius-full);
}

.status-indicator {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--success);
  box-shadow: 0 0 10px var(--success);
}

.status-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #34d399;
  letter-spacing: 0.03em;
}

.user-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-pill {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--border-color);
  padding: 7px 14px;
  border-radius: var(--radius-full);
  font-size: 0.85rem;
  color: var(--text-main);
}

@media (max-width: 768px) {
  .system-status {
    display: none;
  }
  .navbar-container {
    padding: 12px 16px;
  }
  .user-pill span {
    max-width: 100px;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
</style>
