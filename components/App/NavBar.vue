<template>
  <div class="sidebar">
    <!-- Logo section -->
    <div class="logo-container">
      <img src="/logo_futurz.webp" alt="Futurz" class="w-10 h-10">
      <span class="logo-text">Futurz</span>
    </div>

    <!-- Navigation links -->
    <nav class="nav-links">
      <NuxtLink to="/" class="nav-item">
        <div class="icon">
          <UIcon name="material-symbols-light:home-rounded" class="w-6 h-6" />
        </div>
        <span>Simulateur</span>
      </NuxtLink>

      <NuxtLink to="/simulation" class="nav-item">
        <UIcon name="material-symbols-light:table-chart-view" class="w-5 h-5" />
        <span>Résultats</span>
      </NuxtLink>
    </nav>

    <!-- Logout button at the bottom -->
    <div class="logout-container">
      <button class="logout-btn" @click="handleLogout">
        <UIcon name="material-symbols-light:exit-to-app-rounded" class="w-5 h-5" />
        <span>Déconnexion</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const { clearAuth } = useAuth()
const router = useRouter()

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
  font-size: 20px;
  font-weight: bold;
  color: #333;
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
  color: #666;
  text-decoration: none;
  transition: background-color 0.2s;
  gap: 12px;
  font-size: 14px;
}

.nav-item:hover {
  background-color: #f3f4f6;
}

.nav-item.router-link-active {
  background-color: #f3f4f6;
  color: #1a56db;
  font-weight: 500;
}

.icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  color: #4c82db;
  /* Blue color for icons */
}

.logout-container {
  margin-top: auto;
  padding: 16px;
  border-top: 1px solid #f0f0f0;
}

.logout-btn {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 10px 16px;
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
  gap: 12px;
  font-size: 14px;
  text-align: left;
}

.logout-btn:hover {
  color: #1a56db;
}
</style>