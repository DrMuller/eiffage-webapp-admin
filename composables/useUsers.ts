import { ref } from 'vue'
import type { User } from '~/types/auth'

export const useUsers = () => {
  const { $api } = useNuxtApp()

  const currentUser = ref<User | null>(null)
  const users = ref<User[]>([])
  const managers = ref<User[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Get current user profile
  async function getCurrentUser(): Promise<User> {
    loading.value = true
    error.value = null

    try {
      const user = await $api<User>('/users/me', {
        method: 'GET'
      })

      currentUser.value = user
      return user
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch user'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Get all users (admin only)
  async function getAllUsers(): Promise<User[]> {
    loading.value = true
    error.value = null

    try {
      const allUsers = await $api<User[]>('/admin/users', {
        method: 'GET'
      })

      users.value = allUsers
      return allUsers
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch users'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Refresh current user data
  async function refreshCurrentUser(): Promise<void> {
    if (currentUser.value) {
      await getCurrentUser()
    }
  }

  // Update user (admin only)
  async function updateUser(
    userId: string,
    userData: {
      firstName?: string;
      lastName?: string;
      code?: string;
      managerUserIds?: string[];
      roles?: string[];
      jobId?: string | null;
    }
  ): Promise<User> {
    loading.value = true
    error.value = null

    try {
      const updatedUser = await $api<User>(`/admin/users/${userId}`, {
        method: 'PUT',
        body: userData
      })

      // Update the user in the local list
      const userIndex = users.value.findIndex(u => u._id === userId)
      if (userIndex !== -1) {
        users.value[userIndex] = updatedUser
      }

      return updatedUser
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update user'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function getAllManagers(): Promise<User[]> {
    loading.value = true
    error.value = null
    try {
      const allManagers = await $api<User[]>('/admin/users/managers', {
        method: 'GET'
      })
      managers.value = allManagers
      return allManagers
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch managers'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Refresh users list
  async function refreshUsers(): Promise<void> {
    await getAllUsers()
  }

  // Search users (admin only)
  async function searchUsers(params: { q?: string; skillName?: string; jobName?: string; observedLevel?: string; jobIds?: string[]; skills?: Array<{ skillId: string; minLevel: number }> } = {}): Promise<User[]> {
    loading.value = true
    error.value = null

    try {
      const query = new URLSearchParams()
      if (params.q) query.set('q', params.q)
      if (params.skillName) query.set('skillName', params.skillName)
      if (params.jobName) query.set('jobName', params.jobName)
      if (params.observedLevel) query.set('observedLevel', params.observedLevel)
      if (params.jobIds && params.jobIds.length > 0) {
        // Use repeated params: ?jobIds=a&jobIds=b
        params.jobIds.filter(Boolean).forEach((id) => query.append('jobIds', id))
      }
      // New: repeated pairs of skills with levels
      if (params.skills && params.skills.length > 0) {
        params.skills.forEach(({ skillId, minLevel }) => {
          if (skillId && Number.isFinite(minLevel)) {
            query.append('skillIds', skillId)
            query.append('levels', String(minLevel))
          }
        })
      }

      const url = `/admin/users/search${query.toString() ? `?${query.toString()}` : ''}`
      const results = await $api<User[]>(url, { method: 'GET' })
      users.value = results
      return results
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to search users'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    currentUser,
    users,
    managers,
    loading,
    error,
    getAllManagers,
    getCurrentUser,
    getAllUsers,
    updateUser,
    refreshCurrentUser,
    refreshUsers,
    searchUsers
  }
}
