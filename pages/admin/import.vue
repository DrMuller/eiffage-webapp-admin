<script setup lang="ts">
import { ref } from 'vue'
import { useSirhImport } from '~/composables/useSirhImport'
import { useHabilitationImport } from '~/composables/useHabilitationImport'

// SIRH Import
const { uploadSirhCsv, loading: sirhLoading, error: sirhError, result: sirhResult } = useSirhImport()
const sirhFile = ref<File | null>(null)
const sirhSuccess = ref<string | null>(null)

async function onSirhSubmit() {
    sirhSuccess.value = null
    const file = sirhFile.value
    if (!file) return
    await uploadSirhCsv(file)
    sirhSuccess.value = 'Import SIRH terminé'
}

// Habilitation Import
const { uploadHabilitationCsv, loading: habilitationLoading, error: habilitationError, result: habilitationResult } = useHabilitationImport()
const habilitationFile = ref<File | null>(null)
const habilitationSuccess = ref<string | null>(null)

async function onHabilitationSubmit() {
    habilitationSuccess.value = null
    const file = habilitationFile.value
    if (!file) return
    await uploadHabilitationCsv(file)
    habilitationSuccess.value = 'Import Habilitation terminé'
}
</script>

<template>
    <div class="container mx-auto p-6">
        <h1 class="text-2xl font-semibold mb-6">Importer</h1>

        <!-- SIRH Import Section -->
        <div class="mb-8">
            <h2 class="text-xl font-semibold mb-4">Import SIRH (Utilisateurs et Emplois)</h2>
            <div class="space-y-4">
                <UFileUpload v-model="sirhFile" accept=".csv,.xlsx,.xls,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel" 
                    label="Déposez votre fichier CSV ou Excel ici"
                    description="Formats supportés: CSV, XLSX, XLS" layout="list" :interactive="false" class="w-full max-w-xl min-h-32">
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
                    <UButton :label="sirhLoading ? 'Import...' : 'Lancer l\'import SIRH'" color="info" 
                        :loading="sirhLoading" :disabled="!sirhFile" @click="onSirhSubmit" />
                    <span v-if="sirhError" class="text-red-600">{{ sirhError }}</span>
                    <span v-if="sirhSuccess" class="text-green-600">{{ sirhSuccess }}</span>
                </div>

                <div v-if="sirhResult" class="mt-4 p-4 bg-gray-50 rounded-lg text-sm">
                    <div class="font-medium mb-2">Résultat de l'import SIRH:</div>
                    <div class="space-y-1">
                        <div>✓ Jobs traités: <span class="font-semibold">{{ sirhResult.jobsProcessed }}</span></div>
                        <div>✓ Utilisateurs traités: <span class="font-semibold">{{ sirhResult.usersProcessed }}</span></div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Divider -->
        <div class="border-t border-gray-200 mb-8"></div>

        <!-- Habilitation Import Section -->
        <div>
            <h2 class="text-xl font-semibold mb-4">Import Habilitations</h2>
            <div class="space-y-4">
                <UFileUpload v-model="habilitationFile" accept=".csv,.xlsx,.xls,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel" 
                    label="Déposez votre fichier CSV ou Excel ici"
                    description="Formats supportés: CSV, XLSX, XLS (Extraction Acciline)" layout="list" :interactive="false" 
                    class="w-full max-w-xl min-h-32">
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
                    <UButton :label="habilitationLoading ? 'Import...' : 'Lancer l\'import Habilitations'" 
                        color="info" :loading="habilitationLoading" :disabled="!habilitationFile" 
                        @click="onHabilitationSubmit" />
                    <span v-if="habilitationError" class="text-red-600">{{ habilitationError }}</span>
                    <span v-if="habilitationSuccess" class="text-green-600">{{ habilitationSuccess }}</span>
                </div>

                <div v-if="habilitationResult" class="mt-4 p-4 bg-gray-50 rounded-lg text-sm">
                    <div class="font-medium mb-2">Résultat de l'import Habilitations:</div>
                    <div class="space-y-1">
                        <div>✓ Créées/Mises à jour: <span class="font-semibold">{{ habilitationResult.created }}</span></div>
                        <div>⊘ Ignorées: <span class="font-semibold">{{ habilitationResult.skipped }}</span></div>
                    </div>
                    
                    <div v-if="habilitationResult.errors.length > 0" class="mt-3">
                        <div class="font-medium text-red-700 mb-1">Erreurs ({{ habilitationResult.errors.length }}):</div>
                        <ul class="list-disc list-inside space-y-1 text-red-600">
                            <li v-for="(err, index) in habilitationResult.errors.slice(0, 5)" :key="index">{{ err }}</li>
                            <li v-if="habilitationResult.errors.length > 5" class="text-gray-600">
                                ... et {{ habilitationResult.errors.length - 5 }} autres erreurs
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
