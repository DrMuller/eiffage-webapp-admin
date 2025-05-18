import { ref } from 'vue'
import type { Simulation, SimulationRequest } from '~/types/simulation'
import { useCaptable } from './useCaptable'
import type { CaptableRequest } from '#components'

export const useSimulation = () => {
    const simulations = ref<Simulation[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)
    const { $api } = useNuxtApp()

    // Transform a date string to Date object
    const transformDate = (dateString: string | Date): Date => {
        return dateString instanceof Date ? dateString : new Date(dateString)
    }

    // Transform the simulation request object
    const transformResponseRequest = (request: any) => {
        if (!request) return request
        const { transformCaptableResponse } = useCaptable()

        return {
            ...request,
            captable: transformCaptableResponse(request.captable)
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
            const data = await $api<Simulation>('/simulations', { method: 'GET' })
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
            const data = await $api<Simulation>(`/simulations/${id}`, { method: 'GET' })
            return transformResponse(data)
        } catch (e) {
            error.value = e instanceof Error ? e.message : 'Failed to fetch simulation'
            return null
        } finally {
            loading.value = false
        }
    }

    const createSimulation = async (request: Omit<SimulationRequest, '_id'>) => {
        loading.value = true
        error.value = null
        const { transformCaptableRequest } = useCaptable()
        const data = await $api<Simulation>('/simulations', {
            method: 'POST',
            body: {
                clientId: request.clientId,
                captableRequest: transformCaptableRequest(request.captable)
            }
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