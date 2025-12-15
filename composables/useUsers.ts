import { ref } from 'vue'
import type { User } from '~/types/auth'
import type { PaginationMeta } from '~/types/common'

export interface TeamStats {
  managerId: string
  managerName: string
  teamSize: number
  currentCampaign: {
    _id: string
    startDate: string
    endDate: string
  } | null
  keySkillsMastery: {
    masteredSkillsCount: number
    totalEvaluatedSkillsCount: number
    percentage: number
  }
  evaluationProgress: {
    evaluatedMembersCount: number
    totalMembersCount: number
    percentage: number
  }
}

export const useUsers = () => {
  const { $api } = useNuxtApp()

  const currentUser = ref<User | null>(null)
  const users = ref<User[]>([])
  const managers = ref<User[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const paginationMeta = ref<PaginationMeta | null>(null)

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

  // Get user by ID
  async function getUserById(userId: string): Promise<User> {
    loading.value = true
    error.value = null

    try {
      const user = await $api<User>(`/admin/users/${userId}`, {
        method: 'GET'
      })
      return user
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch user'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Get all users (admin only)
  async function getAllUsers(params?: { page?: number; limit?: number }): Promise<User[]> {
    loading.value = true
    error.value = null

    try {
      const headers: Record<string, string> = {}
      if (params?.page) headers['x-page'] = params.page.toString()
      if (params?.limit) headers['x-limit'] = params.limit.toString()

      const response = await $api<{ data: User[], meta: PaginationMeta }>('/admin/users', {
        method: 'GET',
        headers
      })

      users.value = response.data
      paginationMeta.value = response.meta
      return response.data
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
  async function searchUsers(params: {
    q?: string;
    managerUserId?: string;
    skillName?: string;
    jobName?: string;
    observedLevel?: string;
    jobIds?: string[];
    skills?: Array<{ skillId: string; minLevel: number }>;
    gender?: 'MALE' | 'FEMALE';
    establishmentName?: string;
    ageMin?: number;
    ageMax?: number;
    seniorityMin?: number;
    seniorityMax?: number;
    page?: number;
    limit?: number
  } = {}): Promise<User[]> {
    loading.value = true
    error.value = null

    try {
      const query = new URLSearchParams()
      if (params.q) query.set('q', params.q)
      if (params.skillName) query.set('skillName', params.skillName)
      if (params.jobName) query.set('jobName', params.jobName)
      if (params.observedLevel) query.set('observedLevel', params.observedLevel)
      if (params.gender) query.set('gender', params.gender)
      if (params.establishmentName) query.set('establishmentName', params.establishmentName)
      if (params.ageMin) query.set('ageMin', String(params.ageMin))
      if (params.ageMax) query.set('ageMax', String(params.ageMax))
      if (params.seniorityMin) query.set('seniorityMin', String(params.seniorityMin))
      if (params.seniorityMax) query.set('seniorityMax', String(params.seniorityMax))
      if (params.managerUserId) query.set('managerUserId', params.managerUserId)
      if (params.jobIds && params.jobIds.length > 0) {
        // Use repeated params: ?jobIds=a&jobIds=b
        params.jobIds.filter(Boolean).forEach((id) => query.append('jobIds', id))
      }
      // New: repeated pairs of skills with levels
      if (params.skills && params.skills.length > 0) {
        params.skills.forEach(({ skillId, minLevel }) => {
          if (skillId && minLevel) {
            query.append('skillIds', skillId)
            query.append('levels', String(minLevel))
          }
        })
      }

      const headers: Record<string, string> = {}
      if (params.page) headers['x-page'] = params.page.toString()
      if (params.limit) headers['x-limit'] = params.limit.toString()

      const url = `/admin/users/search${query.toString() ? `?${query.toString()}` : ''}`
      const response = await $api<{ data: User[], meta: PaginationMeta }>(url, { method: 'GET', headers })
      users.value = response.data
      paginationMeta.value = response.meta
      return response.data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to search users'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Invite user (admin only)
  async function inviteUser(userId: string): Promise<void> {
    loading.value = true
    error.value = null

    try {
      await $api(`/admin/users/${userId}/invite`, {
        method: 'POST'
      })

      // Update the user in the local list to reflect the new invitedAt timestamp
      const userIndex = users.value.findIndex(u => u._id === userId)
      if (userIndex !== -1) {
        users.value[userIndex].invitedAt = new Date()
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to invite user'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Get team stats for a manager
  async function getTeamStats(managerId: string): Promise<TeamStats> {
    loading.value = true
    error.value = null

    try {
      const stats = await $api<TeamStats>(`/admin/users/${managerId}/team-stats`, {
        method: 'GET'
      })
      return stats
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch team stats'
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
    paginationMeta,
    getUserById,
    getAllManagers,
    getCurrentUser,
    getAllUsers,
    updateUser,
    refreshCurrentUser,
    refreshUsers,
    searchUsers,
    inviteUser,
    getTeamStats
  }
}
