import { ref } from 'vue'
import type { Evaluation } from '~/types/evaluation'

// API response type with string dates
type EvaluationApiResponse = Omit<Evaluation, 'createdAt' | 'updatedAt'> & {
    createdAt: string
    updatedAt: string
}

export const useEvaluations = () => {
    const { $api } = useNuxtApp()

    const evaluations = ref<Evaluation[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)

    // Transform response to convert date strings to Date objects
    function transformEvaluation(evaluation: EvaluationApiResponse): Evaluation {
        return {
            ...evaluation,
            createdAt: new Date(evaluation.createdAt),
            updatedAt: new Date(evaluation.updatedAt),
        }
    }

    async function getEvaluations(): Promise<Evaluation[]> {
        loading.value = true
        error.value = null

        try {
            const response = await $api<EvaluationApiResponse[]>('/evaluations', {
                method: 'GET'
            })

            const transformed = response.map(transformEvaluation)
            evaluations.value = transformed
            return transformed
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Failed to fetch evaluations'
            throw err
        } finally {
            loading.value = false
        }
    }

    async function getEvaluationById(id: string): Promise<Evaluation> {
        loading.value = true
        error.value = null

        try {
            const response = await $api<EvaluationApiResponse>(`/evaluations/${id}?includeSkills=true`, {
                method: 'GET'
            })

            return transformEvaluation(response)
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Failed to fetch evaluation'
            throw err
        } finally {
            loading.value = false
        }
    }

    async function getEvaluationsByUserId(userId: string): Promise<Evaluation[]> {
        loading.value = true
        error.value = null

        try {
            const response = await $api<EvaluationApiResponse[]>('/evaluations', {
                method: 'GET'
            })

            const transformed = response.map(transformEvaluation)
            const userEvaluations = transformed.filter((e) => e.userId === userId)
            return userEvaluations
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Failed to fetch user evaluations'
            throw err
        } finally {
            loading.value = false
        }
    }

    return {
        evaluations,
        loading,
        error,
        getEvaluations,
        getEvaluationById,
        getEvaluationsByUserId,
    }
}

