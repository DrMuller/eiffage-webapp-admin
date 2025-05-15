


import { ref } from 'vue'
import type { Organisation } from '~/types/organisation'

// State will be preserved across component instances
const organisations = ref<Organisation[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

const { transformOrganisation } = useOrganisation()

export const useOrganisationAdmin = () => {
  const nuxtApp = useNuxtApp()

  // Get all organisations
  const fetchOrganisationsAdmin = async () => {
    loading.value = true
    error.value = null
    try {
      const data = await nuxtApp.$api<Organisation[]>('/admin/organisations', { method: 'GET' })
      organisations.value = data.map(transformOrganisation)
      return organisations.value
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch organisations'
      return []
    } finally {
      loading.value = false
    }
  }

  return {
    organisations,
    loading,
    error,
    fetchOrganisationsAdmin
  }
} 