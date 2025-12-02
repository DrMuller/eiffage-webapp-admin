import { ref } from 'vue'
import type { HabilitationImportResult } from '~/types/habilitation'

export function useHabilitationImport() {
    const { $api } = useNuxtApp()
    const loading = ref(false)
    const error = ref<string | null>(null)
    const result = ref<HabilitationImportResult | null>(null)

    async function uploadHabilitationCsv(file: File): Promise<HabilitationImportResult> {
        loading.value = true
        error.value = null
        result.value = null
        try {
            const form = new FormData()
            form.append('file', file)
            const res = await $api<HabilitationImportResult>('/import/habilitation-csv', {
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

    return { uploadHabilitationCsv, loading, error, result }
}

