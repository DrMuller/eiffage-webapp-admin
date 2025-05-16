


import { ref } from 'vue'
import type { Organisation } from '~/types/organisation'

// State will be preserved across component instances
const loading = ref(false)
const error = ref<string | null>(null)

const { transformOrganisation } = useOrganisation()

const endpoint = '/admin/organisations'

export const useOrganisationAdmin = () => {
  const nuxtApp = useNuxtApp()

  // Create a new organisation
  const createOrganisation = async (organisationData: Omit<Organisation, '_id' | 'createdAt' | 'updatedAt'>) => {
    loading.value = true
    error.value = null
    try {
      const data = await nuxtApp.$api<Organisation>(endpoint, {
        method: 'POST',
        body: organisationData
      })
      return transformOrganisation(data)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to create organisation'
    } finally {
      loading.value = false
    }
  }


  // Get all organisations
  const fetchOrganisationsAdmin = async () => {
    loading.value = true
    error.value = null
    try {
      return await nuxtApp.$api<Organisation[]>(endpoint, { method: 'GET' })
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch organisations'
      return []
    } finally {
      loading.value = false
    }
  }

      // Update an existing organisation
      const updateOrganisation = async (id: string, organisationData: Partial<Omit<Organisation, '_id' | 'createdAt' | 'updatedAt'>>) => {
        loading.value = true
        error.value = null
        try {
            const data = await nuxtApp.$api<Organisation>(`${endpoint}/${id}`, {
                method: 'PUT',
                body: organisationData
            })
            return transformOrganisation(data)
        } catch (e) {
            error.value = e instanceof Error ? e.message : 'Failed to update organisation'
        } finally {
            loading.value = false
        }
    }

    // Delete an organisation
    const deleteOrganisation = async (id: string) => {
        loading.value = true
        error.value = null
        try {
            await nuxtApp.$api(`${endpoint}/${id}`, {
                method: 'DELETE'
            })
        } catch (e) {
            error.value = e instanceof Error ? e.message : 'Failed to delete organisation'
            return false
        } finally {
            loading.value = false
        }
    }

    // Upload a logo for an organisation
    const uploadOrganisationLogo = async (id: string, logoFile: File) => {
        loading.value = true
        error.value = null
        try {
            const formData = new FormData()
            formData.append('logo', logoFile)

            const data = await nuxtApp.$api<Organisation>(`${endpoint}/${id}/logo`, {
                method: 'POST',
                body: formData
            })

            return transformOrganisation(data)
        } catch (e) {
            error.value = e instanceof Error ? e.message : 'Failed to upload organisation logo'
        } finally {
            loading.value = false
        }
    }


  return {
    loading,
    error,
    fetchOrganisationsAdmin,
    createOrganisation,
    updateOrganisation,
    deleteOrganisation,
    uploadOrganisationLogo
  }
} 