import { ref } from 'vue'
import type { Simulation } from '~/types/simulation'
import type { SimulationRequest } from '~/types/simulationRequest'

export const useSimulation = () => {
    const simulations = ref<Simulation[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)
    const { $api } = useNuxtApp()

    const fetchLastSimulation = async () => {
        loading.value = true
        error.value = null
        try {
            const data = await $api<Simulation>('/simulations')
            return data
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
            return data
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
        try {
            const data = await $api<Simulation>('/simulations', {
                method: 'POST',
                body: request
            })
            simulations.value.push(data)
            return data
        } catch (e) {
            error.value = e instanceof Error ? e.message : 'Failed to create simulation'
            return null
        } finally {
            loading.value = false
        }
    }

    // Update an existing simulation
    const updateSimulation = async (id: string, request: Partial<SimulationRequest>) => {
        loading.value = true
        error.value = null
        try {
            const data = await $api<Simulation>(`/simulations/${id}`, {
                method: 'PUT',
                body: request
            })
            const index = simulations.value.findIndex(s => s.id === id)
            if (index !== -1) {
                simulations.value[index] = data
            }
            return data
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
            simulations.value = simulations.value.filter(s => s.id !== id)
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