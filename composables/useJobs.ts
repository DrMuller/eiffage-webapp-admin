import { ref } from 'vue'
import type { Job, JobSkillResponse, JobSkillLevelDistribution } from '~/types/jobs'

export const useJobs = () => {
    const { $api } = useNuxtApp()

    const jobs = ref<Job[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)

    async function getJobs(query: string = ''): Promise<Job[]> {
        loading.value = true
        error.value = null

        try {
            const url = query && query.trim().length > 0 ? `/jobs?q=${encodeURIComponent(query)}` : '/jobs'
            const response = await $api<Job[]>(url, { method: 'GET' })
            jobs.value = response
            return response
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Failed to fetch jobs'
            throw err
        } finally {
            loading.value = false
        }
    }

    async function getJobById(jobId: string): Promise<Job> {
        loading.value = true
        error.value = null

        try {
            const response = await $api<Job>(`/jobs/${jobId}`, { method: 'GET' })
            return response
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Failed to fetch job'
            throw err
        } finally {
            loading.value = false
        }
    }

    async function getJobSkills(jobId: string): Promise<JobSkillResponse[]> {
        return await $api<JobSkillResponse[]>(`/jobs/${jobId}/skills`, { method: 'GET' })
    }

    async function addSkillToJob(jobId: string, skillId: string, expectedLevel: number): Promise<JobSkillResponse> {
        return await $api<JobSkillResponse>(`/jobs/${jobId}/skills`, {
            method: 'POST',
            body: { skillId, expectedLevel }
        })
    }

    async function updateJobSkillLevel(jobId: string, skillId: string, expectedLevel: number): Promise<JobSkillResponse> {
        return await $api<JobSkillResponse>(`/jobs/${jobId}/skills/${skillId}`, {
            method: 'PUT',
            body: { expectedLevel }
        })
    }

    async function removeSkillFromJob(jobId: string, skillId: string): Promise<void> {
        return await $api<void>(`/jobs/${jobId}/skills/${skillId}`, {
            method: 'DELETE'
        })
    }

    async function getJobSkillLevelDistribution(jobId: string): Promise<JobSkillLevelDistribution[]> {
        return await $api<JobSkillLevelDistribution[]>(`/jobs/${jobId}/skills/distribution`, { method: 'GET' })
    }

    return {
        jobs,
        loading,
        error,
        getJobs,
        getJobById,
        getJobSkills,
        addSkillToJob,
        updateJobSkillLevel,
        removeSkillFromJob,
        getJobSkillLevelDistribution,
    }
}


