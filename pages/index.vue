<template>
  <div class="home-container">
    <section class="hero">
      <h1>Welcome to Futurz</h1>
      <p>A Nuxt 3 application with JWT authentication</p>
      <div class="cta-buttons">
        <NuxtLink v-if="!isAuthenticated" to="/signin" class="btn btn-primary">Sign In</NuxtLink>
        <NuxtLink v-else to="/dashboard" class="btn btn-primary">Go to Dashboard</NuxtLink>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const { isAuthenticated } = useAuth()
</script>

<style scoped>
.home-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.hero {
  text-align: center;
  padding: 4rem 0;
}

.hero h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.hero p {
  font-size: 1.25rem;
  color: #666;
  margin-bottom: 2rem;
}

.cta-buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-weight: 500;
  text-decoration: none;
  transition: background-color 0.2s ease;
}

.btn-primary {
  background-color: #0066cc;
  color: white;
}

.btn-primary:hover {
  background-color: #0055aa;
}
</style>