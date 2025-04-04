import { ref } from 'vue'
import type { Simulation, SimulationResult } from '~/types/simulation'
import type { PrefShare, SimulationRequest } from '~/types/simulationRequest'

export const useSimulation = () => {
    const simulations = ref<Simulation[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)
    const { $api } = useNuxtApp()

    // Transform a date string to Date object
    const transformDate = (dateString: string | Date): Date => {
        return dateString instanceof Date ? dateString : new Date(dateString)
    }

    const transformRequest = (request: any) => {
        return {
            ...request,
            params: {
                ...request.params,
                carve_out: request.params.carve_out / 100,
            },
            pref_shares: request.pref_shares.map((share: PrefShare) => ({
                ...share,
                pref_tri: share.pref_tri / 100
            }))
        }
    }

    // Transform preference shares dates
    const transformResponsePrefShares = (prefShares: PrefShare[] = []) => {
        return prefShares.map(share => ({
            ...share,
            pref_tri: share.pref_tri * 100,
            date: share.date ? transformDate(share.date) : share.date
        }))
    }

    // Transform common shares dates
    const transformResponseCommonShares = (commonShares: any[] = []) => {
        return commonShares.map(share => ({
            ...share,
            date: share.date ? transformDate(share.date) : share.date
        }))
    }

    // Transform options dates
    const transformResponseOptions = (options: any[] = []) => {
        return options.map(option => ({
            ...option,
            date: option.date ? transformDate(option.date) : option.date
        }))
    }

    const transformResponseParams = (params: any) => {
        return {
            ...params,
            carve_out: params.carve_out * 100,
            estimated_transfer_date: transformDate(params.estimated_transfer_date)
        }
    }

    // Transform the simulation request object
    const transformResponseRequest = (request: any) => {
        if (!request) return request

        return {
            ...request,
            pref_shares: transformResponsePrefShares(request.pref_shares),
            common_shares: transformResponseCommonShares(request.common_shares),
            options: transformResponseOptions(request.options),
            params: transformResponseParams(request.params)
        }
    }

    // Transform simulation data by converting date strings to Date objects
    const transformResponse = (data: any): Simulation => {
        if (!data) return data

        return {
            ...data,
            created_at: data.created_at ? transformDate(data.created_at) : data.created_at,
            updated_at: data.updated_at ? transformDate(data.updated_at) : data.updated_at,
            request: transformResponseRequest(data.request)
        } as Simulation
    }

    const fetchLastSimulation = async () => {
        loading.value = true
        error.value = null
        try {
            const data = await $api<Simulation>('/simulations')
            return transformResponse(data)
        } catch (e) {
            error.value = e instanceof Error ? e.message : 'Failed to fetch simulations'
        } finally {
            loading.value = false
        }
    }

    const fetchSimulationById = async (id: string) => {
        loading.value = true
        error.value = null
        try {
            const data = await $api<Simulation>(`/simulations/${id}`)
            return transformResponse(data)
        } catch (e) {
            error.value = e instanceof Error ? e.message : 'Failed to fetch simulation'
            return null
        } finally {
            loading.value = false
        }
    }

    const createSimulation = async (request: Omit<SimulationRequest, 'id'>) => {
        loading.value = true
        error.value = null
        console.log(request.pref_shares.map(share => share.date.toISOString()))
        const data = await $api<Simulation>('/simulations', {
            method: 'POST',
            body: transformRequest(request)
        })
        const transformedData = transformResponse(data)
        simulations.value.push(transformedData)
        return transformedData
    }

    // Delete a simulation
    const deleteSimulation = async (id: string) => {
        loading.value = true
        error.value = null
        try {
            await $api(`/simulations/${id}`, {
                method: 'DELETE'
            })
            simulations.value = simulations.value.filter(s => s._id !== id)
            return true
        } catch (e) {
            error.value = e instanceof Error ? e.message : 'Failed to delete simulation'
            return false
        } finally {
            loading.value = false
        }
    }

    return {
        simulations,
        loading,
        error,
        fetchLastSimulation,
        fetchSimulationById,
        createSimulation,
        deleteSimulation
    }
} 