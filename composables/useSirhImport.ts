import { ref } from 'vue'

type ImportResult = { jobsProcessed: number; usersProcessed: number }

export function useSirhImport() {
    const { $api } = useNuxtApp()
    const loading = ref(false)
    const error = ref<string | null>(null)
    const result = ref<ImportResult | null>(null)

    async function uploadSirhCsv(file: File): Promise<ImportResult> {
        loading.value = true
        error.value = null
        result.value = null
        try {
            const form = new FormData()
            form.append('file', file)
            const res = await $api<ImportResult>('/import/sirh-csv', {
                method: 'POST',
                body: form,
            })
            result.value = res
            return res
        } catch (e: any) {
            error.value = e?.message || 'Upload failed'
            throw e
        } finally {
            loading.value = false
        }
    }

    return { uploadSirhCsv, loading, error, result }
}



