<template>
  <div>
    <header class="main-header">
      <div class="container">
        <h1 class="logo">Futurz</h1>
        <nav class="main-nav">
          <NuxtLink to="/">Home</NuxtLink>
          <template v-if="isAuthenticated">
            <NuxtLink to="/dashboard">Dashboard</NuxtLink>
            <button @click="handleLogout" class="logout-btn">Logout</button>
          </template>
          <template v-else>
            <NuxtLink to="/signin">Sign In</NuxtLink>
          </template>
        </nav>
      </div>
    </header>
    
    <main class="main-content">
      <NuxtPage />
    </main>
    
    <footer class="main-footer">
      <div class="container">
        <p>© {{ new Date().getFullYear() }} Futurz. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
const router = useRouter()
const { isAuthenticated, clearAuth } = useAuth()

async function handleLogout() {
  try {
    await $api('/auth/logout', { method: 'POST' })
  } catch (error) {
    console.error('Logout error:', error)
  } finally {
    clearAuth()
    router.push('/signin')
  }
}
</script>

<style>
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #333;
  line-height: 1.6;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.main-header {
  background-color: #f5f5f5;
  padding: 1rem 0;
  border-bottom: 1px solid #e0e0e0;
}

.main-header .container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
}

.main-nav {
  display: flex;
  gap: 1.5rem;
  align-items: center;
}

.main-nav a {
  text-decoration: none;
  color: #333;
  font-weight: 500;
}

.main-nav a:hover {
  color: #0066cc;
}

.main-nav a.router-link-active {
  color: #0066cc;
}

.main-content {
  min-height: calc(100vh - 160px);
  padding: 2rem 0;
}

.main-footer {
  background-color: #f5f5f5;
  padding: 1.5rem 0;
  border-top: 1px solid #e0e0e0;
  text-align: center;
}

.logout-btn {
  background: none;
  border: none;
  color: #333;
  font-weight: 500;
  cursor: pointer;
  padding: 0;
  font-size: 1rem;
}

.logout-btn:hover {
  color: #e53935;
}
</style>
