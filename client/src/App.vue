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
import { getAuthToken, clearAuthToken } from './services/api';

const user = ref<{ id: string; email: string; isVerified: boolean } | null>(null);

const showChangeEmailModal = ref(false);
const showChangePasswordModal = ref(false);

onMounted(() => {
  const token = getAuthToken();
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      user.value = {
        id: payload.userId,
        email: payload.email,
        isVerified: true,
      };
    } catch {
      clearAuthToken();
    }
  }
});

function handleAuthenticated(u: { id: string; email: string; isVerified: boolean }) {
  user.value = u;
}

function handleLogout() {
  clearAuthToken();
  user.value = null;
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
