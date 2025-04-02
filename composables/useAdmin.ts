import { ref } from 'vue'
import type { User } from '~/types/auth'
import type { CreateUserRequest, CreateUserWithoutPasswordRequest } from '~/types/admin'

export const useAdmin = () => {
  const { $api } = useNuxtApp()

  const users = ref<User[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Get all users (admin only)
  async function getAllUsers(): Promise<User[]> {
    loading.value = true
    error.value = null

    try {
      const response = await $api<User[]>('/admin/users', {
        method: 'GET'
      })

      users.value = response
      return response
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch users'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Create user with password (admin only)
  async function createUser(userData: CreateUserRequest): Promise<User> {
    loading.value = true
    error.value = null

    try {
      const user = await $api<User>('/admin/users', {
        method: 'POST',
        body: userData
      })

      // Add the new user to the local list
      users.value.push(user)
      return user
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create user'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Create user without password (admin only) - via auth endpoint
  async function createUserWithoutPassword(userData: CreateUserWithoutPasswordRequest): Promise<User> {
    loading.value = true
    error.value = null

    try {
      const user = await $api<User>('/admin/users', {
        method: 'POST',
        body: userData
      })

      // Add the new user to the local list
      users.value.push(user)
      return user
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create user without password'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Refresh users list
  async function refreshUsers(): Promise<void> {
    await getAllUsers()
  }

  return {
    users,
    loading,
    error,
    getAllUsers,
    createUser,
    createUserWithoutPassword,
    refreshUsers
  }
}
