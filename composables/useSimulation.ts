import { ref } from 'vue'
import type { Simulation, SimulationResult } from '~/types/simulation'
import type { SimulationRequest } from '~/types/simulationRequest'

// Define chart series item type
interface ChartSeriesItem {
    values: number[];
    color: string;
    dash?: number[];
    lineWidth?: number;
}

// Define a color palette for chart series
const CHART_COLORS = {
    PREF_SHARES_BASE: ['#004f63', '#08878a', '#77bfa8', '#2c6e49', '#4c956c'],
    COMMON_SHARES: '#77bfa8',
    PRORATA_FD: '#bbbbbb'
}

export const useSimulation = () => {
    const simulations = ref<Simulation[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)
    const { $api } = useNuxtApp()

    // Transform a date string to Date object
    const transformDate = (dateString: string | Date): Date => {
        return dateString instanceof Date ? dateString : new Date(dateString)
    }

    // Transform preference shares dates
    const transformPrefShares = (prefShares: any[] = []) => {
        return prefShares.map(share => ({
            ...share,
            date: share.date ? transformDate(share.date) : share.date
        }))
    }

    // Transform common shares dates
    const transformCommonShares = (commonShares: any[] = []) => {
        return commonShares.map(share => ({
            ...share,
            date: share.date ? transformDate(share.date) : share.date
        }))
    }

    // Transform options dates
    const transformOptions = (options: any[] = []) => {
        return options.map(option => ({
            ...option,
            date: option.date ? transformDate(option.date) : option.date
        }))
    }

    // Transform the simulation request object
    const transformRequest = (request: any) => {
        if (!request) return request

        return {
            ...request,
            estimated_transfer_date: transformDate(request.estimated_transfer_date),
            pref_shares: transformPrefShares(request.pref_shares),
            common_shares: transformCommonShares(request.common_shares),
            options: transformOptions(request.options)
        }
    }

    // Transform simulation data by converting date strings to Date objects
    const transformSimulationData = (data: any): Simulation => {
        if (!data) return data

        return {
            ...data,
            created_at: data.created_at ? transformDate(data.created_at) : data.created_at,
            updated_at: data.updated_at ? transformDate(data.updated_at) : data.updated_at,
            request: transformRequest(data.request)
        } as Simulation
    }

    const fetchLastSimulation = async () => {
        loading.value = true
        error.value = null
        try {
            const data = await $api<Simulation>('/simulations')
            return transformSimulationData(data)
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
            return transformSimulationData(data)
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
        const data = await $api<Simulation>('/simulations', {
            method: 'POST',
            body: request
        })
        const transformedData = transformSimulationData(data)
        simulations.value.push(transformedData)
        return transformedData
    }

    // Update an existing simulation
    const updateSimulation = async (id: string, request: Partial<SimulationRequest>) => {
        loading.value = true
        error.value = null
        try {
            const data = await $api<Simulation>(`/simulations/${id}`, {
                method: 'PATCH',
                body: request
            })
            const transformedData = transformSimulationData(data)

            // Update the simulation in the array
            const index = simulations.value.findIndex(s => s._id === id)
            if (index !== -1) {
                simulations.value[index] = transformedData
            }

            return transformedData
        } catch (e) {
            error.value = e instanceof Error ? e.message : 'Failed to update simulation'
            return null
        } finally {
            loading.value = false
        }
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
        updateSimulation,
        deleteSimulation
    }
} 