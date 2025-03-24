<template>
  <div class="min-h-screen flex items-center justify-center bg-blue-50">
    <div class="p-6 bg-white rounded-lg shadow-sm">
      <div class="mb-8">
        <img src="/logo_futurz.webp" alt="Futurz" class="w-10 h-10 mb-6">
        <h1 class="text-3xl font-bold">Démarrer avec Futurz</h1>
      </div>

      <form @submit.prevent="handleSubmit">
        <div class="mb-6">
          <label for="email" class="block mb-2 text-gray-700">Email</label>
          <input id="email" v-model="email" type="email" required placeholder="john.doe@gmail.com"
            class="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
        </div>

        <div class="flex gap-4 mb-6">
          <div class="w-1/2">
            <label for="lastName" class="block mb-2 text-gray-700">Nom</label>
            <input id="lastName" v-model="lastName" type="text" required placeholder="nom"
              class="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
          </div>
          <div class="w-1/2">
            <label for="firstName" class="block mb-2 text-gray-700">Prénom</label>
            <input id="firstName" v-model="firstName" type="text" required placeholder="prénom"
              class="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
          </div>
        </div>

        <div class="mb-2">
          <label for="phone" class="block mb-2 text-gray-700">Numéro de téléphone</label>
          <div class="flex">
            <div class="flex items-center px-3 py-3 bg-white border border-r-0 border-gray-300 rounded-l-md">
              <!-- <img src="/france-flag.png" alt="France" class="w-6 h-4 mr-2"> -->
              <span>+33</span>
            </div>
            <input id="phone" v-model="phone" type="tel" required
              class="w-full px-4 py-3 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500">
          </div>
        </div>
        <p v-if="phoneError" class="mb-4 text-sm text-orange-600">Le numéro doit être valide</p>

        <div class="mb-6">
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

        <div class="mb-4">
          <div class="flex items-center">
            <input id="termsAccepted" v-model="termsAccepted" type="checkbox" required
              class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500">
            <label for="termsAccepted" class="ml-2 text-sm text-gray-700">
              J'accepte les
              <a href="/terms" class="text-gray-900 underline">Termes et Conditions</a>
              et la
              <a href="/privacy" class="text-gray-900 underline">Politique de confidentialité</a>
            </label>
          </div>
        </div>

        <div class="mb-6">
          <div class="flex items-center">
            <input id="marketingOptIn" v-model="marketingOptIn" type="checkbox"
              class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500">
            <label for="marketingOptIn" class="ml-2 text-sm text-gray-700">
              Ne m'envoyez pas d'email promotionel
            </label>
          </div>
        </div>

        <button type="submit" :disabled="isLoading"
          class="w-full py-3 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
          {{ isLoading ? 'Création en cours...' : 'Créer votre compte' }}
        </button>

        <div class="mt-6 text-center">
          <p class="text-sm text-gray-600">
            Vous avez déjà compte ?
            <NuxtLink to="/auth/signin" class="text-blue-600 hover:underline">Connectez-vous ici</NuxtLink>
          </p>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import type { AuthTokens, User } from '~/types/auth'

const firstName = ref('')
const lastName = ref('')
const email = ref('')
const phone = ref('')
const password = ref('')
const showPassword = ref(false)
const termsAccepted = ref(false)
const marketingOptIn = ref(false)
const phoneError = ref(false)
const error = ref('')
const isLoading = ref(false)
const router = useRouter()

const { $api } = useNuxtApp()
const { setAuth } = useAuth()

async function handleSubmit() {
  error.value = ''
  phoneError.value = false

  // Simple phone validation
  const phoneRegex = /^[0-9]{9,10}$/
  if (!phoneRegex.test(phone.value)) {
    phoneError.value = true
    return
  }

  isLoading.value = true

  try {
    // Register the user
    const tokens = await $api<AuthTokens>('/auth/signup', {
      method: 'POST',
      body: {
        firstName: firstName.value,
        lastName: lastName.value,
        email: email.value,
        phone: '+33' + phone.value,
        password: password.value,
        marketingOptIn: !marketingOptIn.value
      }
    })

    // Get user details
    const user = await $api<User>('/users/me', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`
      }
    })

    setAuth(user, tokens)
    router.push('/')
  } catch (err) {
    error.value = err.message || 'Failed to sign up'
  } finally {
    isLoading.value = false
  }
}
</script>