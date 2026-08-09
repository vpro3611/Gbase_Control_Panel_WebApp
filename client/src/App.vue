<template>
  <div class="app-shell">
    <Navbar
      :user="user"
      @logout="handleLogout"
      @open-change-email="showChangeEmailModal = true"
      @open-change-password="showChangePasswordModal = true"
    />

    <main class="content">
      <AuthView
        v-if="!user"
        @authenticated="handleAuthenticated"
      />

      <ContainerDashboard
        v-else
        :user="user"
      />
    </main>

    <!-- Change Email Modal -->
    <ChangeEmailModal
      v-if="showChangeEmailModal"
      @close="showChangeEmailModal = false"
      @updated="handleEmailUpdated"
    />

    <!-- Change Password Modal -->
    <ChangePasswordModal
      v-if="showChangePasswordModal"
      @close="showChangePasswordModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import Navbar from './components/Navbar.vue';
import AuthView from './components/AuthView.vue';
import ContainerDashboard from './components/ContainerDashboard.vue';
import ChangeEmailModal from './components/ChangeEmailModal.vue';
import ChangePasswordModal from './components/ChangePasswordModal.vue';
import { api } from './services/api';

const user = ref<{ id: string; email: string; isVerified: boolean } | null>(null);

const showChangeEmailModal = ref(false);
const showChangePasswordModal = ref(false);

onMounted(async () => {
  try {
    const res = await api.me();
    if (res.user) {
      user.value = res.user;
    }
  } catch {
    user.value = null;
  }
});

function handleAuthenticated(u: { id: string; email: string; isVerified: boolean }) {
  user.value = u;
}

async function handleLogout() {
  try {
    await api.logout();
  } catch (err) {
    console.error('Logout error:', err);
  } finally {
    user.value = null;
  }
}

function handleEmailUpdated(newEmail: string) {
  if (user.value) {
    user.value.email = newEmail;
  }
}
</script>

<style scoped>
.app-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
.content {
  flex: 1;
}
</style>
