import { ref } from 'vue'
import type { Organisation } from '~/types/organisation'

// State will be preserved across component instances
const organisation = ref<Organisation>()
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
            return null
        } finally {
            loading.value = false
        }
    }

    // Create a new organisation
    const createOrganisation = async (organisationData: Omit<Organisation, '_id' | 'createdAt' | 'updatedAt'>) => {
        loading.value = true
        error.value = null
        try {
            const data = await nuxtApp.$api<Organisation>('/organisations', {
                method: 'POST',
                body: organisationData
            })
            const newOrganisation = transformOrganisation(data)
            organisation.value = newOrganisation
            return newOrganisation
        } catch (e) {
            error.value = e instanceof Error ? e.message : 'Failed to create organisation'
            return null
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
            const updatedOrganisation = transformOrganisation(data)

            // Update the organisation in the local state
            organisation.value = updatedOrganisation

            return updatedOrganisation
        } catch (e) {
            error.value = e instanceof Error ? e.message : 'Failed to update organisation'
            return null
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
            organisation.value = undefined
            return true
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

            const updatedOrganisation = transformOrganisation(data)

            // Update the organisation in the local state
            organisation.value = updatedOrganisation

            return updatedOrganisation
        } catch (e) {
            error.value = e instanceof Error ? e.message : 'Failed to upload organisation logo'
            return null
        } finally {
            loading.value = false
        }
    }

    return {
        organisation,
        loading,
        error,
        transformOrganisation,
        fetchOrganisationById,
        createOrganisation,
        updateOrganisation,
        deleteOrganisation,
        uploadOrganisationLogo
    }
} 