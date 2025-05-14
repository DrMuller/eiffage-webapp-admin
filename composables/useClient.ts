import { ref } from 'vue'
import type { Client } from '~/types/client'

// State will be preserved across component instances
const clients = ref<Client[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

export const useClient = () => {
    const nuxtApp = useNuxtApp()

    // Transform dates from API responses
    const transformClient = (client: Partial<Client>): Client => {
        return {
            ...client,
            createdAt: client.createdAt ? new Date(client.createdAt) : new Date(),
            updatedAt: client.updatedAt ? new Date(client.updatedAt) : new Date()
        } as Client
    }

    // Get all clients for the user's organisation
    const fetchClients = async () => {
        loading.value = true
        error.value = null
        try {
            const data = await nuxtApp.$api<Client[]>('/clients', { method: 'GET' })
            clients.value = data.map(transformClient)
            return clients.value
        } catch (e) {
            error.value = e instanceof Error ? e.message : 'Failed to fetch clients'
            return []
        } finally {
            loading.value = false
        }
    }

    // Get a specific client by ID
    const fetchClientById = async (id: string) => {
        loading.value = true
        error.value = null
        try {
            const data = await nuxtApp.$api<Client>(`/clients/${id}`)
            return transformClient(data)
        } catch (e) {
            error.value = e instanceof Error ? e.message : 'Failed to fetch client'
            return null
        } finally {
            loading.value = false
        }
    }

    // Create a new client
    const createClient = async (clientData: Omit<Client, '_id' | 'userId' | 'organisationId' | 'createdAt' | 'updatedAt'>) => {
        loading.value = true
        error.value = null
        try {
            const data = await nuxtApp.$api<Client>('/clients', {
                method: 'POST',
                body: clientData
            })
            const newClient = transformClient(data)
            clients.value.push(newClient)
            return newClient
        } catch (e) {
            error.value = e instanceof Error ? e.message : 'Failed to create client'
            return null
        } finally {
            loading.value = false
        }
    }

    // Update an existing client
    const updateClient = async (id: string, clientData: Partial<Omit<Client, '_id' | 'userId' | 'organisationId' | 'createdAt' | 'updatedAt'>>) => {
        loading.value = true
        error.value = null
        try {
            const data = await nuxtApp.$api<Client>(`/clients/${id}`, {
                method: 'PUT',
                body: clientData
            })
            const updatedClient = transformClient(data)

            // Update the client in the local state
            const index = clients.value.findIndex(c => c._id === id)
            if (index !== -1) {
                clients.value[index] = updatedClient
            }

            return updatedClient
        } catch (e) {
            error.value = e instanceof Error ? e.message : 'Failed to update client'
            return null
        } finally {
            loading.value = false
        }
    }

    // Delete a client
    const deleteClient = async (id: string) => {
        loading.value = true
        error.value = null
        try {
            await nuxtApp.$api(`/clients/${id}`, {
                method: 'DELETE'
            })
            clients.value = clients.value.filter(c => c._id !== id)
            return true
        } catch (e) {
            error.value = e instanceof Error ? e.message : 'Failed to delete client'
            return false
        } finally {
            loading.value = false
        }
    }

    // Upload a logo for a client
    const uploadClientLogo = async (id: string, logoFile: File) => {
        loading.value = true
        error.value = null
        try {
            const formData = new FormData()
            formData.append('logo', logoFile)

            const data = await nuxtApp.$api<Client>(`/clients/${id}/logo`, {
                method: 'POST',
                body: formData
            })

            const updatedClient = transformClient(data)

            // Update the client in the local state
            const index = clients.value.findIndex(c => c._id === id)
            if (index !== -1) {
                clients.value[index] = updatedClient
            }

            return updatedClient
        } catch (e) {
            error.value = e instanceof Error ? e.message : 'Failed to upload client logo'
            return null
        } finally {
            loading.value = false
        }
    }

    return {
        clients,
        loading,
        error,
        fetchClients,
        fetchClientById,
        createClient,
        updateClient,
        deleteClient,
        uploadClientLogo
    }
} 