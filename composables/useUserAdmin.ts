


import { ref } from 'vue'
import type { User } from '~/types/auth'

// State will be preserved across component instances
const loading = ref(false)
const error = ref<string | null>(null)

export const useUserAdmin = () => {
  const nuxtApp = useNuxtApp()


  const createUserAdmin = async (user: Omit<User, 'roles' | '_id' | 'createdAt' | 'updatedAt' | 'password'>) => {
    loading.value = true
    error.value = null
    try {
      return await nuxtApp.$api<User>('/admin/users', { method: 'POST', body: user })
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to create user'
    } finally {
      loading.value = false
    }
  }

  const fetchUsersAdmin = async (organisationId?: string) => {
    loading.value = true
    error.value = null
    try {
      return await nuxtApp.$api<User[]>('/admin/users' + (organisationId ? `?organisationId=${organisationId}` : ''), { method: 'GET' })
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch users'
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    createUserAdmin,
    fetchUsersAdmin,
  }
} 