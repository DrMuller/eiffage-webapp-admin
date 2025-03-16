<template>
  <form class="signin-form" @submit.prevent="handleSubmit">
    <div class="form-group">
      <label for="email">Email</label>
      <input id="email" v-model="email" type="email" required placeholder="Enter your email">
    </div>

    <div class="form-group">
      <label for="password">Password</label>
      <input id="password" v-model="password" type="password" required placeholder="Enter your password">
    </div>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <button type="submit" :disabled="isLoading">
      {{ isLoading ? 'Signing in...' : 'Sign In' }}
    </button>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import type { AuthTokens, User } from '~/types/auth'

const email = ref('')
const password = ref('')
const error = ref('')
const isLoading = ref(false)
const router = useRouter()

const { $api } = useNuxtApp()
const { setAuth } = useAuth()

async function handleSubmit() {
  error.value = ''
  isLoading.value = true

  try {
    const tokens = await $api<AuthTokens>('/auth/signin', {
      method: 'POST',
      body: {
        email: email.value,
        password: password.value
      }
    })

    const user = await $api<User>('/users/me', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`
      }
    })
    setAuth(user, tokens)

    // Redirect to home page or dashboard after successful login
    router.push('/dashboard')
  } catch (err) {
    error.value = err.message || 'Failed to sign in'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.signin-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

label {
  font-weight: 500;
}

input {
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

button {
  padding: 0.75rem;
  background-color: #0066cc;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

button:disabled {
  background-color: #99c2e8;
  cursor: not-allowed;
}

.error-message {
  color: #e53935;
  font-size: 0.875rem;
}
</style>