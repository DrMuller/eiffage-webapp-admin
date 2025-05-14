import { ref } from 'vue'
import type { CaptableRequest, PrefShareRequest, CommonShareRequest, OptionRequest, CaptableResponse, PrefShareResponse, CommonShareResponse, OptionResponse, ParamsResponse } from '~/types/captable'

// State will be preserved across component instances
const captable = ref<CaptableResponse | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

export const useCaptable = () => {
    const { $api } = useNuxtApp()

    // Transform a date string to Date object
    const transformDate = (dateString: string | Date): Date => {
        return dateString instanceof Date ? dateString : new Date(dateString)
    }

    // Transform request data before sending to API
    const transformRequest = (captableData: Partial<CaptableRequest>) => {
        return {
            ...captableData,
            pref_shares: captableData.pref_shares?.map((share: PrefShareRequest) => ({
                ...share,
                date: share.date instanceof Date ? share.date.toISOString() : share.date,
                // Add any other transformations needed for API (like percentage conversions)
            })),
            common_shares: captableData.common_shares?.map((share: CommonShareRequest) => ({
                ...share,
                date: share.date instanceof Date ? share.date.toISOString() : share.date,
            })),
            options: captableData.options?.map((option: OptionRequest) => ({
                ...option,
                date: option.date instanceof Date ? option.date.toISOString() : option.date,
            })),
            params: captableData.params ? {
                ...captableData.params,
                carve_out: captableData.params.carve_out,
                estimated_transfer_date: captableData.params.estimated_transfer_date instanceof Date
                    ? captableData.params.estimated_transfer_date.toISOString()
                    : captableData.params.estimated_transfer_date
            } : undefined
        }
    }

    // Transform preference shares dates from response
    const transformResponsePrefShares = (prefShares: PrefShareResponse[] = []) => {
        return prefShares.map(share => ({
            ...share,
            date: share.date ? transformDate(share.date) : new Date()
        }))
    }

    // Transform common shares dates from response
    const transformResponseCommonShares = (commonShares: CommonShareResponse[] = []) => {
        return commonShares.map(share => ({
            ...share,
            date: share.date ? transformDate(share.date) : new Date()
        }))
    }

    // Transform options dates from response
    const transformResponseOptions = (options: OptionResponse[] = []) => {
        return options.map(option => ({
            ...option,
            date: option.date ? transformDate(option.date) : new Date()
        }))
    }

    // Transform params from response
    const transformResponseParams = (params: ParamsResponse) => {
        return {
            ...params,
            estimated_transfer_date: params.estimated_transfer_date
                ? transformDate(params.estimated_transfer_date)
                : undefined
        }
    }

    // Transform captable data from response
    const transformResponse = (captableData: Partial<CaptableResponse>): CaptableResponse => {
        if (!captableData) return captableData as CaptableResponse

        return {
            ...captableData,
            pref_shares: transformResponsePrefShares(captableData.pref_shares || []),
            common_shares: transformResponseCommonShares(captableData.common_shares || []),
            options: transformResponseOptions(captableData.options || []),
            params: transformResponseParams(captableData.params as ParamsResponse)
        } as CaptableResponse
    }

    // Create a new captable for a client
    const createCaptable = async (clientId: string, captableData: CaptableRequest) => {
        loading.value = true
        error.value = null
        try {
            const data = await $api<CaptableResponse>(`/clients/${clientId}/captable`, {
                method: 'POST',
                body: transformRequest(captableData)
            })
            captable.value = transformResponse(data)
            return captable.value
        } catch (e) {
            error.value = e instanceof Error ? e.message : 'Failed to create captable'
            return null
        } finally {
            loading.value = false
        }
    }

    // Update an existing captable
    const updateCaptable = async (clientId: string, captableId: string, captableData: Partial<CaptableRequest>) => {
        loading.value = true
        error.value = null
        try {
            const data = await $api<CaptableResponse>(`/clients/${clientId}/captable/${captableId}`, {
                method: 'PUT',
                body: transformRequest(captableData)
            })
            captable.value = transformResponse(data)
            return captable.value
        } catch (e) {
            error.value = e instanceof Error ? e.message : 'Failed to update captable'
            return null
        } finally {
            loading.value = false
        }
    }

    // Get a specific captable by ID
    const fetchCaptable = async (clientId: string) => {
        loading.value = true
        error.value = null
        try {
            const data = await $api<CaptableResponse>(`/clients/${clientId}/captable`)
            captable.value = transformResponse(data)
            return captable.value
        } catch (e) {
            error.value = e instanceof Error ? e.message : 'Failed to fetch captable'
            return null
        } finally {
            loading.value = false
        }
    }

    return {
        captable,
        loading,
        error,
        createCaptable,
        updateCaptable,
        fetchCaptable,
        transformCaptableResponse: transformResponse,
        transformCaptableRequest: transformRequest
    }
} 