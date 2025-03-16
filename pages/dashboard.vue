<template>
  <div class="dashboard-container">
    <h1>Dashboard</h1>
    <p v-if="user">Welcome, {{ user.email }}</p>
    <button @click="handleLogout">Logout</button>
  </div>
</template>

<script setup lang="ts">
const router = useRouter()
const { user, clearAuth } = useAuth()

// Define route meta
definePageMeta({
  middleware: ['auth'],
  requiresAuth: true
})

async function handleLogout() {
  clearAuth()
  router.push('/signin')
}
</script>

<style scoped>
.dashboard-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

button {
  padding: 0.75rem 1rem;
  background-color: #e53935;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  margin-top: 1rem;
}
</style>