import { ref } from 'vue'
import type { User } from '~/types/auth'
import type { Organisation } from '~/types/organisation'

// State will be preserved across component instances
const loading = ref(false)
const error = ref<string | null>(null)

export const useOrganisation = () => {
    const nuxtApp = useNuxtApp()

    // Transform dates from API responses
    const transformOrganisation = (organisation: Partial<Organisation>): Organisation => {
        return {
            ...organisation,
            createdAt: organisation.createdAt ? new Date(organisation.createdAt) : new Date(),
            updatedAt: organisation.updatedAt ? new Date(organisation.updatedAt) : new Date()
        } as Organisation
    }

    // Get a specific organisation by ID
    const fetchOrganisationById = async (id: string) => {
        loading.value = true
        error.value = null
        try {
            const data = await nuxtApp.$api<Organisation>(`/organisations/${id}`)
            return transformOrganisation(data)
        } catch (e) {
            error.value = e instanceof Error ? e.message : 'Failed to fetch organisation'
        } finally {
            loading.value = false
        }
    }

    // Update an existing organisation
    const updateOrganisation = async (id: string, organisationData: Partial<Omit<Organisation, '_id' | 'createdAt' | 'updatedAt'>>) => {
        loading.value = true
        error.value = null
        try {
            const data = await nuxtApp.$api<Organisation>(`/organisations/${id}`, {
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
            await nuxtApp.$api(`/organisations/${id}`, {
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

            const data = await nuxtApp.$api<Organisation>(`/organisations/${id}/logo`, {
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

    const fetchUsersByOrganisationId = async (id: string) => {
        loading.value = true
        error.value = null
        try {
            return await nuxtApp.$api<User[]>(`/organisations/${id}/users`)
        } catch (e) {
            error.value = e instanceof Error ? e.message : 'Failed to fetch users by organisation id'
        } finally {
            loading.value = false
        }
    }

    return {
        loading,
        error,
        transformOrganisation,
        fetchOrganisationById,
        fetchUsersByOrganisationId,
        updateOrganisation,
        deleteOrganisation,
        uploadOrganisationLogo
    }
} 