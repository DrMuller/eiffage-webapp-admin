import { ref } from 'vue'
import type { EvaluationCampaign } from '~/types/evaluationCampaign'

interface CreateEvaluationCampaignRequest {
    startDate: string | Date
    endDate: string | Date
}

interface UpdateEvaluationCampaignRequest {
    startDate?: string | Date
    endDate?: string | Date
}

export const useEvaluationCampaigns = () => {
    const { $api } = useNuxtApp()

    const campaigns = ref<EvaluationCampaign[]>([])
    const current = ref<EvaluationCampaign | null>(null)
    const loading = ref(false)
    const error = ref<string | null>(null)

    async function getAll(): Promise<EvaluationCampaign[]> {
        loading.value = true
        error.value = null

        try {
            const response = await $api<EvaluationCampaign[]>('/evaluation-campaigns', { method: 'GET' })
            campaigns.value = response
            return response
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Failed to fetch campaigns'
            throw err
        } finally {
            loading.value = false
        }
    }

    async function getById(id: string): Promise<EvaluationCampaign> {
        loading.value = true
        error.value = null

        try {
            const response = await $api<EvaluationCampaign>(`/evaluation-campaigns/${id}`, { method: 'GET' })
            current.value = response
            return response
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Failed to fetch campaign'
            throw err
        } finally {
            loading.value = false
        }
    }

    async function getCurrent(): Promise<EvaluationCampaign | null> {
        loading.value = true
        error.value = null

        try {
            const response = await $api<EvaluationCampaign>('/evaluation-campaigns/current', { method: 'GET' })
            current.value = response
            return response
        } catch (err) {
            // Return null if no active campaign (404)
            current.value = null
            return null
        } finally {
            loading.value = false
        }
    }

    async function create(data: CreateEvaluationCampaignRequest): Promise<EvaluationCampaign> {
        loading.value = true
        error.value = null

        try {
            const body = {
                startDate: typeof data.startDate === 'string' ? data.startDate : data.startDate.toISOString(),
                endDate: typeof data.endDate === 'string' ? data.endDate : data.endDate.toISOString(),
            }
            const response = await $api<EvaluationCampaign>('/evaluation-campaigns', { method: 'POST', body })
            campaigns.value.push(response)
            return response
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Failed to create campaign'
            throw err
        } finally {
            loading.value = false
        }
    }

    async function update(id: string, data: UpdateEvaluationCampaignRequest): Promise<EvaluationCampaign> {
        loading.value = true
        error.value = null

        try {
            const body: { startDate?: string, endDate?: string } = {}
            if (data.startDate !== undefined) body.startDate = typeof data.startDate === 'string' ? data.startDate : data.startDate.toISOString()
            if (data.endDate !== undefined) body.endDate = typeof data.endDate === 'string' ? data.endDate : data.endDate.toISOString()
            const response = await $api<EvaluationCampaign>(`/evaluation-campaigns/${id}`, { method: 'PUT', body })

            const idx = campaigns.value.findIndex(c => c._id === id)
            if (idx !== -1) campaigns.value[idx] = response
            if (current.value && current.value._id === id) current.value = response
            return response
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Failed to update campaign'
            throw err
        } finally {
            loading.value = false
        }
    }

    async function remove(id: string): Promise<void> {
        loading.value = true
        error.value = null

        try {
            await $api(`/evaluation-campaigns/${id}`, { method: 'DELETE' })
            campaigns.value = campaigns.value.filter(c => c._id !== id)
            if (current.value && current.value._id === id) current.value = null
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Failed to delete campaign'
            throw err
        } finally {
            loading.value = false
        }
    }

    return {
        campaigns,
        current,
        loading,
        error,
        getAll,
        getById,
        getCurrent,
        create,
        update,
        remove,
    }
}


