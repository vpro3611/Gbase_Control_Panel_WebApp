<template>
  <div class="dashboard-container">
    <!-- Summary Header Cards -->
    <div class="stats-grid">
      <div class="stat-card glass-card">
        <div class="stat-header">
          <span class="stat-label">ACTIVE INSTANCES</span>
          <span class="stat-icon">📦</span>
        </div>
        <div class="stat-value">{{ containers.length }} / {{ maxContainers }}</div>
        <div class="progress-bar-bg">
          <div
            class="progress-bar-fill"
            :style="{ width: `${(containers.length / maxContainers) * 100}%` }"
          ></div>
        </div>
        <div class="stat-footer">
          {{ maxContainers - containers.length }} container slots remaining
        </div>
      </div>

      <div class="stat-card glass-card">
        <div class="stat-header">
          <span class="stat-label">SDK WIRE PROTOCOL</span>
          <span class="stat-icon">⚡</span>
        </div>
        <div class="stat-value mono">JSON-over-TCP</div>
        <div class="stat-footer text-muted">
          Compatible with <code>gbase-sdk</code> Node.js & TS driver
        </div>
      </div>

      <div class="stat-card glass-card action-card">
        <h3>Create New Container</h3>
        <p>Spin up an isolated GObase in-memory database instance</p>
        <button
          class="btn btn-primary"
          :disabled="containers.length >= maxContainers"
          @click="showCreateModal = true"
        >
          + Spin Up Instance
        </button>
      </div>
    </div>

    <!-- Error Banner -->
    <div v-if="error" class="error-banner">{{ error }}</div>

    <!-- Containers List Section -->
    <div class="section-title">
      <h2>Your GObase Containers</h2>
      <button class="btn btn-secondary btn-sm" @click="fetchContainers">
        🔄 Refresh
      </button>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Fetching active containers...</p>
    </div>

    <div v-else-if="containers.length === 0" class="empty-state glass-card">
      <div class="empty-icon">🐳</div>
      <h3>No Active Containers</h3>
      <p>You haven't launched any GObase database containers yet.</p>
      <button class="btn btn-primary" @click="showCreateModal = true">
        Spin Up Your First Instance
      </button>
    </div>

    <div v-else class="containers-grid">
      <div
        v-for="c in containers"
        :key="c.id"
        class="container-card glass-card"
      >
        <div class="card-top">
          <div class="container-identity">
            <span class="pulse-dot"></span>
            <h3 class="container-name">{{ c.name }}</h3>
          </div>
          <span class="badge badge-success">RUNNING</span>
        </div>

        <div class="info-row">
          <span class="label">Host Node & Specs:</span>
          <span class="value">{{ c.hostInfo || 'Local Node' }}</span>
        </div>

        <div class="info-row">
          <span class="label">Mapped TCP Port:</span>
          <span class="value mono">:{{ c.port }}</span>
        </div>

        <!-- Connection String Box with 1-Click Copy -->
        <div class="conn-box">
          <div class="conn-label">SDK CONNECTION STRING</div>
          <div class="conn-string-row">
            <code class="conn-text">{{ c.connectionString }}</code>
            <button
              class="btn btn-secondary btn-xs copy-btn"
              @click="copyConnectionString(c.connectionString, c.id)"
            >
              {{ copiedId === c.id ? '✓ Copied' : '📋 Copy' }}
            </button>
          </div>
        </div>

        <div class="card-actions">
          <button class="btn btn-secondary btn-sm" @click="inspectContainer(c.id)">
            🔍 Characteristics
          </button>
          <button class="btn btn-danger btn-sm" @click="confirmDelete(c)">
            🗑️ Delete
          </button>
        </div>
      </div>
    </div>

    <!-- Create Container Modal -->
    <div v-if="showCreateModal" class="modal-overlay">
      <div class="modal-content glass-card">
        <h3>Spin Up New GObase Container</h3>
        <p class="modal-desc">Configure container instance properties</p>

        <form @submit.prevent="handleCreate">
          <div class="form-group">
            <label>Container Instance Name</label>
            <input
              v-model="newContainerName"
              type="text"
              placeholder="e.g. production-cache"
              class="form-input"
            />
          </div>

          <div class="modal-actions">
            <button type="button" class="btn btn-secondary" @click="showCreateModal = false">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary" :disabled="creating">
              {{ creating ? 'Spinning Up...' : 'Launch Container' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Inspect Characteristics Modal -->
    <div v-if="inspectedContainer" class="modal-overlay">
      <div class="modal-content glass-card">
        <h3>Container Characteristics</h3>
        <p class="modal-desc">Detailed hardware and container telemetry</p>

        <div class="details-list">
          <div class="detail-item">
            <span class="d-label">Docker Container ID:</span>
            <code class="d-val">{{ inspectedDetails?.dockerContainerId || inspectedContainer.dockerContainerId }}</code>
          </div>
          <div class="detail-item">
            <span class="d-label">Host Node Name:</span>
            <span class="d-val">{{ inspectedDetails?.hostName || 'Local Desktop' }}</span>
          </div>
          <div class="detail-item">
            <span class="d-label">OS Platform:</span>
            <span class="d-val">{{ inspectedDetails?.platform || 'Windows / Linux' }}</span>
          </div>
          <div class="detail-item">
            <span class="d-label">CPUs Allocated:</span>
            <span class="d-val">{{ inspectedDetails?.cpus || 4 }} Cores</span>
          </div>
          <div class="detail-item">
            <span class="d-label">Total System Memory:</span>
            <span class="d-val">{{ inspectedDetails?.totalMemoryMB || 8192 }} MB</span>
          </div>
          <div class="detail-item">
            <span class="d-label">SDK Protocol Endpoint:</span>
            <code class="d-val">{{ inspectedContainer.connectionString }}</code>
          </div>
        </div>

        <div class="modal-actions">
          <button class="btn btn-secondary" @click="inspectedContainer = null">
            Close
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="containerToDelete" class="modal-overlay">
      <div class="modal-content glass-card">
        <h3 class="danger-title">Delete Container Instance?</h3>
        <p class="modal-desc">
          Are you sure you want to delete <strong>{{ containerToDelete.name }}</strong>?
          This will stop the Docker container and permanently invalidate its connection string.
        </p>

        <div class="modal-actions">
          <button class="btn btn-secondary" @click="containerToDelete = null">
            Cancel
          </button>
          <button class="btn btn-danger" :disabled="deleting" @click="handleDelete">
            {{ deleting ? 'Deleting...' : 'Yes, Delete Container' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { api } from '../services/api';

const maxContainers = 3;
const containers = ref<any[]>([]);
const loading = ref(false);
const creating = ref(false);
const deleting = ref(false);
const error = ref('');
const copiedId = ref<string | null>(null);

const showCreateModal = ref(false);
const newContainerName = ref('');

const inspectedContainer = ref<any | null>(null);
const inspectedDetails = ref<any | null>(null);

const containerToDelete = ref<any | null>(null);

onMounted(() => {
  fetchContainers();
});

async function fetchContainers() {
  loading.value = true;
  error.value = '';
  try {
    const res = await api.listContainers();
    containers.value = res.containers;
  } catch (err: any) {
    error.value = err.message || 'Failed to load containers';
  } finally {
    loading.value = false;
  }
}

async function handleCreate() {
  creating.value = true;
  error.value = '';
  try {
    await api.createContainer(newContainerName.value || undefined);
    showCreateModal.value = false;
    newContainerName.value = '';
    await fetchContainers();
  } catch (err: any) {
    error.value = err.message || 'Failed to create container';
  } finally {
    creating.value = false;
  }
}

async function inspectContainer(id: string) {
  try {
    const res = await api.getContainerInfo(id);
    inspectedContainer.value = res.container;
    inspectedDetails.value = res.details;
  } catch (err: any) {
    error.value = err.message || 'Failed to fetch container details';
  }
}

function confirmDelete(c: any) {
  containerToDelete.value = c;
}

async function handleDelete() {
  if (!containerToDelete.value) return;
  deleting.value = true;
  try {
    await api.deleteContainer(containerToDelete.value.id);
    containerToDelete.value = null;
    await fetchContainers();
  } catch (err: any) {
    error.value = err.message || 'Failed to delete container';
  } finally {
    deleting.value = false;
  }
}

function copyConnectionString(str: string, id: string) {
  navigator.clipboard.writeText(str);
  copiedId.value = id;
  setTimeout(() => {
    if (copiedId.value === id) copiedId.value = null;
  }, 2000);
}
</script>

<style scoped>
.dashboard-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px 60px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 36px;
}

.stat-card {
  padding: 24px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.stat-label {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--text-muted);
  letter-spacing: 1px;
}

.stat-value {
  font-size: 1.8rem;
  font-weight: 800;
  color: var(--text-main);
  margin-bottom: 12px;
}

.progress-bar-bg {
  height: 6px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 12px;
}

.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--primary) 0%, var(--accent) 100%);
  border-radius: 4px;
  transition: width 0.4s ease;
}

.stat-footer {
  font-size: 0.8rem;
  color: var(--text-dim);
}

.action-card h3 {
  font-size: 1.1rem;
  margin-bottom: 4px;
}

.action-card p {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-bottom: 16px;
}

.section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.containers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 24px;
}

.container-card {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.container-identity {
  display: flex;
  align-items: center;
  gap: 10px;
}

.container-name {
  font-size: 1.15rem;
  color: var(--text-main);
}

.info-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.88rem;
}

.info-row .label {
  color: var(--text-muted);
}

.info-row .value {
  color: var(--text-main);
  font-weight: 500;
}

.conn-box {
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid var(--border-color);
  padding: 12px;
  border-radius: var(--radius-sm);
}

.conn-label {
  font-size: 0.65rem;
  font-weight: 700;
  color: var(--primary);
  letter-spacing: 1px;
  margin-bottom: 6px;
}

.conn-string-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.conn-text {
  font-size: 0.85rem;
  color: #4ade80;
  word-break: break-all;
}

.btn-xs {
  padding: 4px 10px;
  font-size: 0.75rem;
}

.card-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.error-banner {
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: var(--danger);
  padding: 12px 16px;
  border-radius: var(--radius-sm);
  margin-bottom: 24px;
}

.modal-desc {
  font-size: 0.9rem;
  color: var(--text-muted);
  margin-bottom: 20px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.details-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 8px;
}

.d-label {
  color: var(--text-muted);
}

.d-val {
  color: var(--text-main);
  font-weight: 500;
}

.danger-title {
  color: var(--danger);
}
</style>
