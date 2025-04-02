import { ref, reactive } from 'vue'
import type { AuthTokens, User, LoginRequest, SignupRequest, LoginResponse, RefreshTokenResponse } from '~/types/auth'

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

  const { $api } = useNuxtApp()

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
  async function initAuth() {
    if (cookie.value) {
      // console.log('Initializing auth state from cookies')
      try {
        const { accessToken, refreshToken } = cookie.value
        tokens.accessToken = accessToken
        tokens.refreshToken = refreshToken
        isAuthenticated.value = true

        // Fetch user details with the tokens
        const userData = await $api<User>('/users/me', { method: 'GET' })
        user.value = userData
      } catch (e) {
        console.log('Failed to fetch user details')
        // If this fails, tokens might be invalid
        // clearAuth()
      }
    }
  }

  // Auth API methods
  async function signup(data: SignupRequest): Promise<LoginResponse> {
    try {
      const response = await $api<LoginResponse>('/auth/signup', {
        method: 'POST',
        body: data
      })
      
      setAuth(response.user, response.tokens)
      return response
    } catch (error) {
      console.error('Signup failed:', error)
      throw error
    }
  }

  async function signin(data: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await $api<LoginResponse>('/auth/signin', {
        method: 'POST',
        body: data
      })
      
      setAuth(response.user, response.tokens)
      return response
    } catch (error) {
      console.error('Signin failed:', error)
      throw error
    }
  }

  async function signout(): Promise<void> {
    try {
      clearAuth()
      await navigateTo('/auth/signin')
    } catch (error) {
      console.error('Signout failed:', error)
      throw error
    }
  }

  async function refreshAccessToken(): Promise<string> {
    try {
      const response = await $api<RefreshTokenResponse>('/auth/refresh', {
        method: 'POST',
        body: { refreshToken: tokens.refreshToken }
      })
      
      updateAccessToken(response.accessToken)
      return response.accessToken
    } catch (error) {
      console.error('Token refresh failed:', error)
      clearAuth()
      throw error
    }
  }

  async function requestPasswordReset(email: string): Promise<void> {
    try {
      await $api('/auth/reset-password-token', {
        method: 'POST',
        body: { email }
      })
    } catch (error) {
      console.error('Password reset request failed:', error)
      throw error
    }
  }

  async function resetPassword(password: string, token: string): Promise<void> {
    try {
      await $api('/auth/reset-password', {
        method: 'POST',
        body: { password, token }
      })
    } catch (error) {
      console.error('Password reset failed:', error)
      throw error
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
    initAuth,
    signup,
    signin,
    signout,
    refreshAccessToken,
    requestPasswordReset,
    resetPassword
  }
}