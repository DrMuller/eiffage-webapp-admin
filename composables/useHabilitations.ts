import { ref } from 'vue'
import type { Habilitation } from '~/types/habilitation'

export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

export function useHabilitations() {
    const { $api } = useNuxtApp()
    const habilitations = ref<Habilitation[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)
    const paginationMeta = ref<PaginationMeta | null>(null)

    async function searchHabilitations(params?: {
        q?: string;
        userId?: string;
        jobId?: string;
        userIds?: string[];
        jobIds?: string[];
        startDateFrom?: string;
        endDateTo?: string;
        page?: number;
        limit?: number;
    }) {
        loading.value = true
        error.value = null
        try {
            const queryParams = new URLSearchParams()
            if (params?.q) queryParams.append('q', params.q)
            if (params?.userId) queryParams.append('userId', params.userId)
            if (params?.jobId) queryParams.append('jobId', params.jobId)
            if (params?.userIds && params.userIds.length > 0) {
                params.userIds.forEach(id => queryParams.append('userIds', id))
            }
            if (params?.jobIds && params.jobIds.length > 0) {
                params.jobIds.forEach(id => queryParams.append('jobIds', id))
            }
            if (params?.startDateFrom) queryParams.append('startDateFrom', params.startDateFrom)
            if (params?.endDateTo) queryParams.append('endDateTo', params.endDateTo)

            const query = queryParams.toString()
            const url = `/habilitations${query ? `?${query}` : ''}`

            // Set pagination headers
            const headers: Record<string, string> = {}
            if (params?.page) headers['x-page'] = params.page.toString()
            if (params?.limit) headers['x-limit'] = params.limit.toString()

            const response = await $api<{ data: Habilitation[], meta: PaginationMeta }>(url, {
                headers, method: 'GET'
            },)

            habilitations.value = response.data
            paginationMeta.value = response.meta
            return response.data
        } catch (e: unknown) {
            error.value = e instanceof Error ? e.message : 'Failed to search habilitations'
            throw e
        } finally {
            loading.value = false
        }
    }

    async function getAllHabilitations() {
        return searchHabilitations()
    }

    async function fetchHabilitationById(id: string) {
        loading.value = true
        error.value = null
        try {
            const data = await $api<Habilitation>(`/habilitations/${id}`)
            return data
        } catch (e: any) {
            error.value = e?.message || 'Failed to fetch habilitation'
            throw e
        } finally {
            loading.value = false
        }
    }

    async function createHabilitation(habilitation: Omit<Habilitation, '_id' | 'createdAt' | 'updatedAt'>) {
        loading.value = true
        error.value = null
        try {
            const data = await $api<Habilitation>('/habilitations', {
                method: 'POST',
                body: habilitation,
            })
            habilitations.value.unshift(data)
            return data
        } catch (e: any) {
            error.value = e?.message || 'Failed to create habilitation'
            throw e
        } finally {
            loading.value = false
        }
    }

    async function updateHabilitation(id: string, updates: Partial<Omit<Habilitation, '_id' | 'createdAt' | 'updatedAt'>>) {
        loading.value = true
        error.value = null
        try {
            const data = await $api<Habilitation>(`/habilitations/${id}`, {
                method: 'PUT',
                body: updates,
            })
            const index = habilitations.value.findIndex(h => h._id === id)
            if (index !== -1) {
                habilitations.value[index] = data
            }
            return data
        } catch (e: any) {
            error.value = e?.message || 'Failed to update habilitation'
            throw e
        } finally {
            loading.value = false
        }
    }

    async function deleteHabilitation(id: string) {
        loading.value = true
        error.value = null
        try {
            await $api(`/habilitations/${id}`, {
                method: 'DELETE',
            })
            habilitations.value = habilitations.value.filter(h => h._id !== id)
        } catch (e: any) {
            error.value = e?.message || 'Failed to delete habilitation'
            throw e
        } finally {
            loading.value = false
        }
    }

    return {
        habilitations,
        loading,
        error,
        paginationMeta,
        getAllHabilitations,
        searchHabilitations,
        fetchHabilitationById,
        createHabilitation,
        updateHabilitation,
        deleteHabilitation,
    }
}

