<template>
  <div class="sidebar">
    <!-- Logo section -->
    <div class="logo-container">
      <img :src="currentOrganisation?.logoUrl || '/logo_futurz.webp'" :alt="currentOrganisation?.name || 'Futurz'"
        class="w-10 h-10">
      <span class="logo-text">{{ currentOrganisation?.name || 'Futurz' }}</span>
    </div>

    <!-- Navigation links -->
    <nav class="nav-links">

      <NuxtLink to="/dossier" class="nav-item"
        :class="{ 'router-link-active router-link-exact-active': route.path.startsWith('/dossier') }">
        <UIcon name="material-symbols-light:grid-view-rounded" class="w-5 h-5" />
        <span>Dossiers</span>
      </NuxtLink>

      <!-- Admin navigation -->
      <div v-if="user?.roles?.includes('ADMIN')" class="nav-item-admin">
        <NuxtLink to="/admin/organisation" class="nav-item"
          :class="{ 'router-link-active router-link-exact-active': route.path.startsWith('/admin/organisations') }">
          <UIcon name="material-symbols-light:shield-lock-outline" class="w-5 h-5" />
          <span>Organisations</span>
        </NuxtLink>
      </div>
    </nav>



    <!-- Logout button at the bottom -->
    <div class="logout-container">

      <NuxtLink to="/settings" class="nav-item"
        :class="{ 'router-link-active router-link-exact-active': route.path.startsWith('/settings') }">
        <UIcon name="material-symbols-light:settings-rounded" class="w-5 h-5" />
        <span>Réglages</span>
      </NuxtLink>
      <button class="logout-btn" @click="handleLogout">
        <UIcon name="material-symbols-light:exit-to-app-rounded" class="w-5 h-5" />
        <span>Déconnexion</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const { clearAuth, user } = useAuth()
const router = useRouter()
const route = useRoute()
const { currentOrganisation } = useOrganisation()


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
  font-size: 16px;
  font-weight: bold;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 140px;
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


.nav-item-admin>.nav-item {
  margin-top: 2rem;
  border-top: 1px solid #f0f0f0;
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