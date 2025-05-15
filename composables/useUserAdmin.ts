


import { ref } from 'vue'
import type { User } from '~/types/auth'

// State will be preserved across component instances
const userCreate = ref<User>()
const loading = ref(false)
const error = ref<string | null>(null)

export const useUserAdmin = () => {
  const nuxtApp = useNuxtApp()


  const createUserAdmin = async (user: User) => {
    loading.value = true
    error.value = null
    try {
      userCreate.value = await nuxtApp.$api<User>('/admin/users', { method: 'POST', body: user })
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to create user'
    } finally {
      loading.value = false
    }
  }

  return {
    userCreate,
    loading,
    error,
    createUserAdmin
  }
} 