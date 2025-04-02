<template>
  <div class="min-h-screen flex items-center justify-center bg-blue-50">
    <div class="p-8 bg-white rounded-lg shadow-sm w-[400px]">
      <div class="mb-8">
        <!-- <img src="/logo.webp" alt="Eiffage" class="w-10 h-10 mb-6"> -->
        <h1 class="text-3xl font-bold">Connexion à Eiffage</h1>
      </div>

      <form @submit.prevent="handleSubmit">
        <div class="mb-4">
          <label for="email" class="block mb-2 text-gray-700">Email</label>
          <input id="email" v-model="email" type="email" required placeholder="john.doe@gmail.com"
            class="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
          <p v-if="emailError" class="mt-1 text-sm text-orange-600">L'email doit être valide</p>
        </div>

        <div class="mb-4">
          <label for="password" class="block mb-2 text-gray-700">Mot de passe</label>
          <div class="relative">
            <input id="password" v-model="password" :type="showPassword ? 'text' : 'password'" required
              placeholder="mot de passe"
              class="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
            <button type="button" class="absolute inset-y-0 right-0 flex items-center px-3 text-gray-600"
              @click="showPassword = !showPassword">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path v-if="!showPassword" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path v-if="!showPassword" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                <path v-if="showPassword" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            </button>
          </div>
        </div>


        <div class="mb-6">
          <NuxtLink to="/auth/forgot-password" class="text-sm text-blue-600 hover:underline">
            Mot de passe oublié ?
          </NuxtLink>
        </div>

        <div v-if="error" class="mb-4 p-3 bg-red-50 text-red-500 rounded-md border border-red-200 text-sm">
          <div class="flex items-center gap-2">
            <UIcon name="material-symbols-light:error-rounded" class="w-5 h-5" />
            <span>{{ error }}</span>
          </div>
        </div>

        <button type="submit" :disabled="isLoading"
          class="w-full py-3 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
          {{ isLoading ? 'Connexion en cours...' : 'Se connecter' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import type { AuthTokens, User } from '~/types/auth'

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const emailError = ref(false)
const error = ref('')
const isLoading = ref(false)
const router = useRouter()

const { $api } = useNuxtApp()
const { setAuth, updateAccessToken } = useAuth()

async function handleSubmit() {
  // error.value = ''
  // emailError.value = false

  // Simple email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email.value)) {
    emailError.value = true
    return
  }

  isLoading.value = true

  try {
    // Login the user
    const tokens = await $api<AuthTokens>('/auth/signin', {
      method: 'POST',
      body: {
        email: email.value,
        password: password.value
      }
    })
    await updateAccessToken(tokens.accessToken)


    // Get user details
    const user = await $api<User>('/users/me', {
      method: 'GET'
    })

    setAuth(user, tokens)
    router.push('/')
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to login'
    error.value = errorMessage
  } finally {
    isLoading.value = false
  }
}
</script>