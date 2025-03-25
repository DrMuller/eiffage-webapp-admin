import { ref } from 'vue'
import type { Simulation } from '~/types/model'

export const useSimulation = () => {
    const simulations = ref<Simulation[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)

    // Fetch all simulations
    const fetchLastSimulation = async () => {
        loading.value = true
        error.value = null
        try {
            const { data, error: fetchError } = await useFetch<Simulation>('/simulations')
            if (fetchError.value) throw fetchError.value
            return data.value
        } catch (e) {
            error.value = e instanceof Error ? e.message : 'Failed to fetch simulations'
        } finally {
            loading.value = false
        }
    }

    // Fetch all simulations
    // const fetchSimulations = async () => {
    //     loading.value = true
    //     error.value = null
    //     try {
    //         const { data, error: fetchError } = await useFetch<Simulation[]>('/simulations')
    //         if (fetchError.value) throw fetchError.value
    //         simulations.value = data.value || []
    //     } catch (e) {
    //         error.value = e instanceof Error ? e.message : 'Failed to fetch simulations'
    //     } finally {
    //         loading.value = false
    //     }
    // }

    // Fetch a single simulation by ID
    const fetchSimulationById = async (id: string) => {
        loading.value = true
        error.value = null
        try {
            const { data, error: fetchError } = await useFetch<Simulation>(`/simulations/${id}`)
            if (fetchError.value) throw fetchError.value
            return data.value
        } catch (e) {
            error.value = e instanceof Error ? e.message : 'Failed to fetch simulation'
            return null
        } finally {
            loading.value = false
        }
    }

    // Create a new simulation
    const createSimulation = async (simulation: Omit<Simulation, 'id'>) => {
        loading.value = true
        error.value = null
        try {
            const { data, error: createError } = await useFetch<Simulation>('/simulations', {
                method: 'POST',
                body: simulation
            })
            if (createError.value) throw createError.value
            simulations.value.push(data.value!)
            return data.value
        } catch (e) {
            error.value = e instanceof Error ? e.message : 'Failed to create simulation'
            return null
        } finally {
            loading.value = false
        }
    }

    // Update an existing simulation
    const updateSimulation = async (id: string, simulation: Partial<Simulation>) => {
        loading.value = true
        error.value = null
        try {
            const { data, error: updateError } = await useFetch<Simulation>(`/simulations/${id}`, {
                method: 'PUT',
                body: simulation
            })
            if (updateError.value) throw updateError.value
            const index = simulations.value.findIndex(s => s.id === id)
            if (index !== -1) {
                simulations.value[index] = data.value!
            }
            return data.value
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
            const { error: deleteError } = await useFetch(`/simulations/${id}`, {
                method: 'DELETE'
            })
            if (deleteError.value) throw deleteError.value
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