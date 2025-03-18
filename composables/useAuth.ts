import { ref, reactive } from 'vue'
import type { AuthTokens, User } from '~/types/auth'

// State will be preserved across component instances
const user = ref<User | null>(null)
const tokens = reactive<AuthTokens>({
  accessToken: '',
  refreshToken: ''
})
const isAuthenticated = ref(false)

// Cookie options
const cookieOptions = {
  maxAge: 60 * 60 * 24 * 7, // 7 days
  path: '/',
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const
}

export const useAuth = () => {
  const nuxtApp = useNuxtApp()
  const cookie = useCookie('auth:tokens', {
    ...cookieOptions,
    encode: (value: AuthTokens | null) => encodeURIComponent(JSON.stringify(value)),
    decode: (value) => JSON.parse(decodeURIComponent(value)) as AuthTokens
  })

  function setAuth(newUser: User, newTokens: AuthTokens) {
    user.value = newUser
    tokens.accessToken = newTokens.accessToken
    tokens.refreshToken = newTokens.refreshToken
    isAuthenticated.value = true
    // Store tokens in cookies for persistence
    cookie.value = newTokens
  }

  function clearAuth() {
    user.value = null
    tokens.accessToken = ''
    tokens.refreshToken = ''
    isAuthenticated.value = false

    // Remove tokens from cookies
    cookie.value = null
  }

  function getAccessToken() {
    return tokens.accessToken
  }

  function getRefreshToken() {
    return tokens.refreshToken
  }

  function updateAccessToken(newAccessToken: string) {
    tokens.accessToken = newAccessToken
    if (cookie.value) {
      // console.log('Updating access token in cookies')
      const storedTokens = cookie.value
      cookie.value = {
        ...storedTokens,
        accessToken: newAccessToken
      }
    }
  }

  // Initialize auth state from cookies on app load
  function initAuth() {
    if (cookie.value) {
      // console.log('Initializing auth state from cookies')
      try {
        const { accessToken, refreshToken } = cookie.value
        tokens.accessToken = accessToken
        tokens.refreshToken = refreshToken
        isAuthenticated.value = true

        // Fetch user details with the tokens
        nuxtApp.$api<User>('/users/me', { method: 'GET' })
          .then((userData: User) => {
            user.value = userData
          })
          .catch(() => {
            console.log('Failed to fetch user details')
            // If this fails, tokens might be invalid
            // clearAuth()
          })
      } catch (e) {
        console.log('Failed to parse tokens from cookies')
        // clearAuth()
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