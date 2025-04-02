import { defineNuxtPlugin } from 'nuxt/app'
import { useAuth } from '~/composables/useAuth'
import type { RefreshTokenResponse } from '~/types/auth'

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()
  const baseURL = config.public.apiBaseUrl || 'http://localhost:9001'

  // Create a pending refresh promise to prevent multiple refresh calls
  let refreshPromise: Promise<string> | null = null

  // Queue for requests waiting for token refresh
  let requestQueue: Array<() => void> = []

  // Process the queue of requests
  const processQueue = (error: Error | null, token: string | null = null) => {
    requestQueue.forEach((callback) => {
      if (error) {
        // If refresh failed, logout the user
        const { clearAuth } = useAuth()
        clearAuth()
      } else {
        // Continue with the original request
        callback()
      }
    })

    // Clear the queue
    requestQueue = []
  }

  // Custom fetch function with authentication and refresh token handling
  async function $api(url: string, options: any = {}, auth: boolean = true) {
    const { getAccessToken, getRefreshToken } = useAuth()

    const fullUrl = url.startsWith('http') ? url : `${baseURL}${url}`
    const headers = new Headers(options.headers || {})

    if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json')
    }

    const accessToken = getAccessToken()
    if (accessToken && auth) {
      headers.set('Authorization', `Bearer ${accessToken}`)
    }

    const fetchOptions: RequestInit = {
      ...options,
      headers: Object.fromEntries(headers.entries()),
      credentials: 'include',
    }

    // Convert body object to JSON string if it's not FormData
    if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
      fetchOptions.body = JSON.stringify(options.body)
    }

    const response = await fetch(fullUrl, fetchOptions)

    // If response is unauthorized and we have a refresh token
    if (response.status === 401 && getRefreshToken()) {
      // If no refresh is in progress, start one
      if (!refreshPromise) {
        refreshPromise = refreshAccessToken()
          .catch((error) => {
            // If refresh fails, clear the queue with error
            processQueue(error)
            throw error
          })
          .finally(() => {
            refreshPromise = null
          })
      }

      // Wait for the refresh token promise to resolve
      return new Promise((resolve, reject) => {
        requestQueue.push(async () => {
          try {
            // Retry the original request with the new token
            const newOptions = { ...fetchOptions }
            const newHeaders = new Headers(newOptions.headers)
            newHeaders.set('Authorization', `Bearer ${getAccessToken()}`)
            newOptions.headers = newHeaders

            const newResponse = await fetch(fullUrl, newOptions)
            processResponse(newResponse).then(resolve).catch(reject)
          } catch (error) {
            reject(error)
          }
        })
      })
    }

    return processResponse(response)
  }

  // Process the fetch response
  async function processResponse(response: Response) {
    if (!response.ok) {
      const error: any = new Error('API request failed')
      try {
        const data = await response.json()
        error.data = data
        error.message = data.message || error.message
      } catch (e) {
        error.status = response.status
        error.statusText = response.statusText
      }
      throw error
    }

    const contentType = response.headers.get('Content-Type') || ''

    if (contentType.includes('application/json')) {
      return response.json()
    }

    return response.text()
  }

  // Refresh the access token
  async function refreshAccessToken(): Promise<string> {
    const { getRefreshToken, updateAccessToken } = useAuth()
    const refreshToken = getRefreshToken()

    if (!refreshToken) {
      throw new Error('No refresh token available')
    }

    try {
      // Call refresh endpoint
      const response = await fetch(`${baseURL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      })

      if (!response.ok) {
        throw new Error('Failed to refresh token')
      }

      const data: RefreshTokenResponse = await response.json()

      // Update the access token
      updateAccessToken(data.accessToken)

      // Resolve all waiting requests
      processQueue(null, data.accessToken)

      return data.accessToken
    } catch (error) {
      // Reject all waiting requests
      processQueue(error as Error)
      throw error
    }
  }

  // Provide the API globally
  nuxtApp.provide('api', $api)

})

// TypeScript declaration for $api
declare module '#app' {
  interface NuxtApp {
    $api: <T>(url: string, options?: unknown, auth?: boolean) => Promise<T>
  }
}

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $api: <T>(url: string, options?: unknown, auth?: boolean) => Promise<T>
  }
}