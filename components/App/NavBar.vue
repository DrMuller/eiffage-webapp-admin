<template>
  <div class="sidebar">
    <!-- Logo section -->
    <div class="logo-container">
      <img src="/full-logo.png" alt="Eiffage">
    </div>

    <!-- Navigation links -->
    <nav class="nav-links">
      <NuxtLink v-if="isAdmin" to="/employes" class="nav-item"
        :class="{ 'router-link-active router-link-exact-active': route.path.startsWith('/users') }">
        <UIcon name="i-heroicons-users" class="w-5 h-5" />
        <span>Employés</span>
      </NuxtLink>
      <NuxtLink to="/competences" class="nav-item"
        :class="{ 'router-link-active router-link-exact-active': route.path.startsWith('/skills') }">
        <UIcon name="i-heroicons-academic-cap" class="w-5 h-5" />
        <span>Compétences</span>
      </NuxtLink>
    </nav>

    <!-- User info and logout at the bottom -->
    <div class="logout-container">
      <div class="user-info">
        <div class="user-name">{{ user?.firstName }} {{ user?.lastName }}</div>
        <div class="user-email">{{ user?.email }}</div>
      </div>
      <button class="logout-btn" @click="handleLogout">
        <UIcon name="i-heroicons-arrow-right-on-rectangle" class="w-5 h-5" />
        <span>Sign Out</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const { clearAuth, user } = useAuth()
const router = useRouter()
const route = useRoute()

// Check if user has admin role
const isAdmin = computed(() => {
  return user.value?.roles?.includes('ADMIN') || false
})

const handleLogout = () => {
  clearAuth()
  router.push('/auth/signin')
}
</script>

<style scoped>
.sidebar {
  display: flex;
  flex-direction: column;
  width: 220px;
  height: 100vh;
  background-color: white;
  border-right: 1px solid #e5e7eb;
}

.logo-container {
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  min-height: 66px;
  display: flex;
  gap: 12px;
  align-items: center;
}

.logo-text {
  font-size: 18px;
  font-weight: bold;
  color: #1f2937;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.nav-links {
  display: flex;
  flex-direction: column;
  padding: 16px 0;
  flex-grow: 1;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  color: #6b7280;
  text-decoration: none;
  transition: all 0.2s;
  gap: 12px;
  font-size: 14px;
  border-radius: 6px;
  margin: 2px 8px;
}

.nav-item:hover {
  background-color: #f3f4f6;
  color: #374151;
}

.nav-item.router-link-active {
  background-color: #dbeafe;
  color: #1d4ed8;
  font-weight: 500;
}

.logout-container {
  margin-top: auto;
  padding: 16px;
  border-top: 1px solid #f0f0f0;
}

.user-info {
  margin-bottom: 12px;
  padding: 0 16px;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.user-email {
  font-size: 12px;
  color: #6b7280;
  margin-top: 2px;
}

.logout-btn {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 10px 16px;
  background: none;
  border: none;
  cursor: pointer;
  color: #6b7280;
  gap: 12px;
  font-size: 14px;
  text-align: left;
  border-radius: 6px;
  transition: all 0.2s;
}

.logout-btn:hover {
  background-color: #fef2f2;
  color: #dc2626;
}
</style>