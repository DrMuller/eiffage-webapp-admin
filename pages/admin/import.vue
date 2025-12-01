<script setup lang="ts">
import { ref } from 'vue'
import { useSirhImport } from '~/composables/useSirhImport'

const { uploadSirhCsv, loading, error, result } = useSirhImport()
const selectedFile = ref<File | null>(null)
const success = ref<string | null>(null)

async function onSubmit() {
    success.value = null
    const file = selectedFile.value
    if (!file) return
    await uploadSirhCsv(file)
    success.value = 'Import terminé'
}
</script>

<template>
    <div class="container mx-auto p-6">
        <h1 class="text-2xl font-semibold mb-4">Importer</h1>
        <div class="space-y-4">
            <UFileUpload v-model="selectedFile" accept=".csv,text/csv" label="Déposez votre fichier CSV ici"
                description="CSV uniquement" layout="list" :interactive="false" class="w-full max-w-xl min-h-32">
                <template #actions="{ open }">
                    <UButton label="Sélectionner un fichier" icon="i-lucide-upload" color="neutral" variant="outline"
                        type="button" @click.stop.prevent="open()" />
                </template>

                <template #files-bottom="slot">
                    <UButton v-if="slot.files" label="Supprimer le fichier" color="neutral" variant="soft"
                        @click="slot.removeFile()" />
                </template>
            </UFileUpload>

            <div class="flex items-center gap-3">
                <UButton :label="loading ? 'Import...' : 'Lancer l\'import'" color="primary" :loading="loading"
                    :disabled="!selectedFile" @click="onSubmit" />
                <span v-if="error" class="text-red-600">{{ error }}</span>
                <span v-if="success" class="text-green-600">{{ success }}</span>
            </div>

            <div v-if="result" class="mt-4 text-sm text-gray-700">
                <div>Jobs traités: {{ result.jobsProcessed }}</div>
                <div>Utilisateurs traités: {{ result.usersProcessed }}</div>
            </div>
        </div>
    </div>

</template>
