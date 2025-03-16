import { ref, reactive } from 'vue'
import type { AuthTokens, User } from '~/types/auth'

// State will be preserved across component instances
const user = ref<User | null>(null)
const tokens = reactive<AuthTokens>({
  accessToken: '',
  refreshToken: ''
})
const isAuthenticated = ref(false)

export const useAuth = () => {
  const nuxtApp = useNuxtApp()

  function setAuth(newUser: User, newTokens: AuthTokens) {
    user.value = newUser
    tokens.accessToken = newTokens.accessToken
    tokens.refreshToken = newTokens.refreshToken
    isAuthenticated.value = true

    // Store tokens in localStorage for persistence
    localStorage.setItem('auth:tokens', JSON.stringify(newTokens))
  }

  function clearAuth() {
    user.value = null
    tokens.accessToken = ''
    tokens.refreshToken = ''
    isAuthenticated.value = false

    // Remove tokens from localStorage
    localStorage.removeItem('auth:tokens')
  }

  function getAccessToken() {
    return tokens.accessToken
  }

  function getRefreshToken() {
    return tokens.refreshToken
  }

  function updateAccessToken(newAccessToken: string) {
    tokens.accessToken = newAccessToken
    const storedTokens = JSON.parse(localStorage.getItem('auth:tokens') || '{}')
    localStorage.setItem('auth:tokens', JSON.stringify({
      ...storedTokens,
      accessToken: newAccessToken
    }))
  }

  // Initialize auth state from localStorage on app load
  function initAuth() {
    if (import.meta.client) {
      const storedTokens = localStorage.getItem('auth:tokens')
      if (storedTokens) {
        try {
          const parsedTokens = JSON.parse(storedTokens) as AuthTokens
          tokens.accessToken = parsedTokens.accessToken
          tokens.refreshToken = parsedTokens.refreshToken
          isAuthenticated.value = true

          // Fetch user details with the tokens
          nuxtApp.$api<User>('/users/me')
            .then((userData: User) => {
              user.value = userData
            })
            .catch(() => {
              // If this fails, tokens might be invalid
              clearAuth()
            })
        } catch (e) {
          clearAuth()
        }
      }
    }
  }

  return {
    user,
    isAuthenticated,
    setAuth,
    clearAuth,
    getAccessToken,
    getRefreshToken,
    updateAccessToken,
    initAuth
  }
}