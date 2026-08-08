<template>
  <div class="dashboard-shell">
    <!-- Hero / Metrics Overview -->
    <div class="metrics-grid">
      <!-- Card 1: Active Instances -->
      <div class="metric-card glass-card">
        <div class="metric-top">
          <span class="metric-title">ACTIVE INSTANCES</span>
          <div class="metric-icon-badge cyan">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
          </div>
        </div>
        <div class="metric-value-row">
          <span class="metric-number">{{ containers.length }}</span>
          <span class="metric-total">/ {{ maxContainers }} Slots</span>
        </div>
        <div class="progress-track">
          <div class="progress-bar" :style="{ width: `${(containers.length / maxContainers) * 100}%` }"></div>
        </div>
        <div class="metric-footer">
          <span>{{ maxContainers - containers.length }} slots remaining for your account</span>
        </div>
      </div>

      <!-- Card 2: Wire Protocol & Specs -->
      <div class="metric-card glass-card">
        <div class="metric-top">
          <span class="metric-title">WIRE PROTOCOL</span>
          <div class="metric-icon-badge purple">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
          </div>
        </div>
        <div class="metric-value-row">
          <span class="metric-code mono">JSON-over-TCP</span>
        </div>
        <div class="protocol-chip">
          <span class="chip-dot"></span>
          <span>Compatible with <code>gbase-sdk</code> Driver</span>
        </div>
      </div>

      <!-- Card 3: Quick Action -->
      <div class="metric-card glass-card action-card">
        <div class="action-header">
          <h3>Provision New Instance</h3>
          <p>Spin up an isolated high-performance GObase database container in seconds.</p>
        </div>
        <button
          class="btn btn-primary btn-launch"
          :disabled="containers.length >= maxContainers"
          @click="showCreateModal = true"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          <span>Spin Up Instance</span>
        </button>
      </div>
    </div>

    <!-- Error Alert -->
    <div v-if="error" class="alert-banner">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      <span>{{ error }}</span>
    </div>

    <!-- Container List Header & Search -->
    <div class="section-bar">
      <div class="section-left">
        <h2>Your GObase Containers</h2>
        <span class="count-badge">{{ containers.length }} active</span>
      </div>
      <div class="section-right">
        <div class="search-input-wrap">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="search-icon"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search by container name or port..."
            class="search-input"
          />
        </div>
        <button class="btn btn-secondary btn-sm" @click="fetchContainers">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" :class="{ 'spin-icon': loading }"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
          <span>Refresh</span>
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-panel glass-card">
      <div class="spinner-glow"></div>
      <p>Fetching container telemetry...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredContainers.length === 0" class="empty-panel glass-card">
      <div class="empty-illustration">
        <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
      </div>
      <h3>No Database Containers Found</h3>
      <p>{{ searchQuery ? 'No containers match your search query.' : "You haven't launched any GObase database containers yet." }}</p>
      <button v-if="!searchQuery" class="btn btn-primary" @click="showCreateModal = true">
        Spin Up Your First Instance
      </button>
    </div>

    <!-- Containers Grid -->
    <div v-else class="containers-grid">
      <div
        v-for="c in filteredContainers"
        :key="c.id"
        class="instance-card glass-card"
      >
        <div class="instance-header">
          <div class="instance-title">
            <span class="pulse-dot"></span>
            <h3>{{ c.name }}</h3>
          </div>
          <span class="badge badge-success">
            <span class="badge-dot"></span>
            RUNNING
          </span>
        </div>

        <div class="instance-spec-rows">
          <div class="spec-row">
            <span class="spec-key">Host Specs</span>
            <span class="spec-val">{{ c.hostInfo || 'Local Node' }}</span>
          </div>

          <div class="spec-row">
            <span class="spec-key">TCP Port</span>
            <span class="spec-val mono-port">:{{ c.port }}</span>
          </div>
        </div>

        <!-- Connection String Box -->
        <div class="conn-card">
          <div class="conn-header">
            <span class="conn-title">SDK CONNECTION ENDPOINT</span>
            <span class="conn-tag">TCP</span>
          </div>
          <div class="conn-body">
            <code class="conn-code">{{ c.connectionString }}</code>
            <button
              class="btn btn-secondary btn-xs copy-btn"
              @click="copyConnectionString(c.connectionString, c.id)"
            >
              <svg v-if="copiedId === c.id" xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
              <span>{{ copiedId === c.id ? 'Copied' : 'Copy' }}</span>
            </button>
          </div>
        </div>

        <div class="instance-actions">
          <button class="btn btn-secondary btn-sm flex-1" @click="inspectContainer(c.id)">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <span>Characteristics</span>
          </button>
          <button class="btn btn-danger btn-sm" @click="confirmDelete(c)">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            <span>Delete</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Spin Up Modal -->
    <div v-if="showCreateModal" class="modal-overlay" @click.self="showCreateModal = false">
      <div class="modal-content glass-card">
        <div class="modal-header">
          <h3>Spin Up New GObase Container</h3>
          <p class="modal-sub">Specify instance settings for your database container</p>
        </div>

        <form @submit.prevent="handleCreate">
          <div class="form-group">
            <label>Instance Name</label>
            <input
              v-model="newContainerName"
              type="text"
              placeholder="e.g. production-cache"
              class="form-input"
              required
            />
          </div>

          <div class="modal-actions">
            <button type="button" class="btn btn-secondary" @click="showCreateModal = false">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary" :disabled="creating">
              <span>{{ creating ? 'Spinning Up...' : 'Launch Container' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Inspect Characteristics Modal -->
    <div v-if="inspectedContainer" class="modal-overlay" @click.self="inspectedContainer = null">
      <div class="modal-content glass-card inspect-modal">
        <div class="modal-header">
          <h3>Container Telemetry & Specs</h3>
          <p class="modal-sub">Detailed specs for <strong>{{ inspectedContainer.name }}</strong></p>
        </div>

        <div class="telemetry-grid">
          <div class="tele-item">
            <span class="tele-label">Container ID</span>
            <code class="tele-val mono">{{ inspectedDetails?.dockerContainerId || inspectedContainer.dockerContainerId }}</code>
          </div>

          <div class="tele-item">
            <span class="tele-label">Host Node Name</span>
            <span class="tele-val">{{ inspectedDetails?.hostName || 'Local Node' }}</span>
          </div>

          <div class="tele-item">
            <span class="tele-label">Platform OS</span>
            <span class="tele-val">{{ inspectedDetails?.platform || 'Windows / Linux' }}</span>
          </div>

          <div class="tele-item">
            <span class="tele-label">CPUs Allocated</span>
            <span class="tele-val">{{ inspectedDetails?.cpus || 4 }} Cores</span>
          </div>

          <div class="tele-item">
            <span class="tele-label">System Memory</span>
            <span class="tele-val">{{ inspectedDetails?.totalMemoryMB || 8192 }} MB</span>
          </div>

          <div class="tele-item">
            <span class="tele-label">Endpoint URI</span>
            <code class="tele-val mono cyan-text">{{ inspectedContainer.connectionString }}</code>
          </div>
        </div>

        <!-- Code Snippet -->
        <div class="code-snippet-box">
          <div class="snippet-header">
            <span>SDK QUICK CONNECT (Node.js / TS)</span>
            <a
              href="https://github.com/vpro3611/GBase-SDK"
              target="_blank"
              rel="noopener noreferrer"
              class="sdk-github-link"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
              <span>GBase-SDK GitHub ↗</span>
            </a>
          </div>
          <pre class="snippet-body"><code>import { GBase } from 'gbase-sdk';

async function main() {
  // Connect to GBase database instance
  const gbase = await GBase.connect('{{ inspectedContainer.connectionString }}');

  // Create a new KV storage instance
  const kv = await gbase.createKvStorage();

  // Store and retrieve typed JSON data
  await kv.set('user:101', { name: 'Alice', score: 95 });
  const user = await kv.get('user:101');

  console.log('User:', user);
  await gbase.close();
}

main();</code></pre>
        </div>

        <div class="modal-actions">
          <button class="btn btn-secondary" @click="inspectedContainer = null">
            Close Telemetry
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Modal -->
    <div v-if="containerToDelete" class="modal-overlay" @click.self="containerToDelete = null">
      <div class="modal-content glass-card">
        <h3 class="danger-title">Delete Container Instance?</h3>
        <p class="modal-sub">
          Are you sure you want to delete <strong>{{ containerToDelete.name }}</strong>?
          This will terminate the Docker instance and invalidate its TCP endpoint.
        </p>

        <div class="modal-actions">
          <button class="btn btn-secondary" @click="containerToDelete = null">
            Cancel
          </button>
          <button class="btn btn-danger" :disabled="deleting" @click="handleDelete">
            <span>{{ deleting ? 'Deleting...' : 'Terminate Instance' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { api } from '../services/api';

const maxContainers = 3;
const containers = ref<any[]>([]);
const loading = ref(false);
const creating = ref(false);
const deleting = ref(false);
const error = ref('');
const searchQuery = ref('');
const copiedId = ref<string | null>(null);

const showCreateModal = ref(false);
const newContainerName = ref('');

const inspectedContainer = ref<any | null>(null);
const inspectedDetails = ref<any | null>(null);

const containerToDelete = ref<any | null>(null);

const filteredContainers = computed(() => {
  if (!searchQuery.value.trim()) return containers.value;
  const q = searchQuery.value.toLowerCase();
  return containers.value.filter(
    (c) => c.name.toLowerCase().includes(q) || String(c.port).includes(q)
  );
});

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
.dashboard-shell {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px 60px;
}

/* Metrics Overview */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
}

.metric-card {
  padding: 24px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 160px;
}

.metric-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.metric-title {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--text-muted);
  letter-spacing: 0.08em;
}

.metric-icon-badge {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
}

.metric-icon-badge.cyan {
  background: rgba(56, 189, 248, 0.15);
  color: var(--primary);
  border: 1px solid rgba(56, 189, 248, 0.3);
}

.metric-icon-badge.purple {
  background: rgba(168, 85, 247, 0.15);
  color: var(--accent);
  border: 1px solid rgba(168, 85, 247, 0.3);
}

.metric-value-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin: 12px 0;
}

.metric-number {
  font-size: 2.2rem;
  font-weight: 800;
  color: #fff;
}

.metric-total {
  font-size: 0.95rem;
  color: var(--text-muted);
  font-weight: 600;
}

.metric-code {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--primary);
}

.progress-track {
  height: 6px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: var(--radius-full);
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, var(--primary) 0%, var(--accent) 100%);
  border-radius: var(--radius-full);
  transition: width 0.4s ease;
}

.metric-footer {
  font-size: 0.78rem;
  color: var(--text-dim);
}

.protocol-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  color: var(--text-muted);
}

.chip-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent);
}

.action-card {
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.85) 0%, rgba(30, 41, 59, 0.6) 100%);
}

.action-header h3 {
  font-size: 1.1rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 4px;
}

.action-header p {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-bottom: 16px;
}

.btn-launch {
  width: 100%;
  padding: 12px;
}

/* Alert Banner */
.alert-banner {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #fca5a5;
  padding: 14px 20px;
  border-radius: var(--radius-md);
  margin-bottom: 32px;
  font-size: 0.9rem;
}

/* Section Bar */
.section-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.section-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.section-left h2 {
  font-size: 1.4rem;
  font-weight: 700;
  color: #fff;
}

.count-badge {
  font-size: 0.75rem;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid var(--border-color);
  padding: 4px 10px;
  border-radius: var(--radius-full);
  color: var(--text-muted);
}

.section-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.search-input-wrap {
  position: relative;
  width: 280px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-dim);
}

.search-input {
  width: 100%;
  background: rgba(8, 12, 20, 0.6);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  padding: 8px 12px 8px 34px;
  color: var(--text-main);
  font-size: 0.85rem;
  transition: var(--transition);
}

.search-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--primary-glow);
}

/* Containers Grid */
.containers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 24px;
}

.instance-card {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.instance-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.instance-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.instance-title h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #fff;
}

.instance-spec-rows {
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: rgba(8, 12, 20, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.04);
  padding: 12px 16px;
  border-radius: var(--radius-sm);
}

.spec-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
}

.spec-key {
  color: var(--text-muted);
}

.spec-val {
  color: var(--text-main);
  font-weight: 500;
}

.mono-port {
  color: var(--primary);
  font-weight: 700;
}

/* Connection Card */
.conn-card {
  background: rgba(6, 9, 19, 0.85);
  border: 1px solid rgba(56, 189, 248, 0.2);
  border-radius: var(--radius-sm);
  padding: 14px;
}

.conn-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.conn-title {
  font-size: 0.68rem;
  font-weight: 700;
  color: var(--primary);
  letter-spacing: 0.08em;
}

.conn-tag {
  font-size: 0.65rem;
  font-weight: 700;
  background: rgba(56, 189, 248, 0.15);
  color: var(--primary);
  padding: 2px 6px;
  border-radius: 4px;
}

.conn-body {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.conn-code {
  font-size: 0.88rem;
  color: #34d399;
  word-break: break-all;
}

.instance-actions {
  display: flex;
  gap: 12px;
}

.flex-1 {
  flex: 1;
}

/* Loading & Empty Panels */
.loading-panel, .empty-panel {
  text-align: center;
  padding: 80px 20px;
}

.spinner-glow {
  width: 44px;
  height: 44px;
  border: 3px solid rgba(56, 189, 248, 0.15);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 1s infinite linear;
  margin: 0 auto 16px;
}

.empty-illustration {
  margin-bottom: 16px;
}

/* Telemetry Inspect Modal */
.inspect-modal {
  max-width: 680px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.telemetry-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin: 20px 0;
}

.tele-item {
  background: rgba(8, 12, 20, 0.6);
  border: 1px solid var(--border-color);
  padding: 12px 14px;
  border-radius: var(--radius-sm);
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
  overflow: hidden;
}

.tele-label {
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
}

.tele-val {
  font-size: 0.88rem;
  color: #fff;
  font-weight: 500;
  word-break: break-all;
  overflow-wrap: anywhere;
}

.cyan-text {
  color: var(--primary);
}

.code-snippet-box {
  background: #04070e;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  overflow: hidden;
  margin-bottom: 24px;
}

.snippet-header {
  background: rgba(255, 255, 255, 0.03);
  padding: 8px 14px;
  border-bottom: 1px solid var(--border-color);
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--primary);
  letter-spacing: 0.05em;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sdk-github-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--text-muted);
  text-decoration: none;
  font-size: 0.72rem;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-color);
  transition: var(--transition);
}

.sdk-github-link:hover {
  color: #fff;
  background: rgba(56, 189, 248, 0.15);
  border-color: rgba(56, 189, 248, 0.4);
}

.snippet-body {
  padding: 14px;
  font-size: 0.82rem;
  color: #a7f3d0;
  overflow-x: auto;
}

.danger-title {
  color: var(--danger);
  margin-bottom: 8px;
}

.modal-sub {
  font-size: 0.88rem;
  color: var(--text-muted);
  margin-bottom: 24px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

@media (max-width: 640px) {
  .telemetry-grid {
    grid-template-columns: 1fr;
  }
  .containers-grid {
    grid-template-columns: 1fr;
  }
}
</style>
