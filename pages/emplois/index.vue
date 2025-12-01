<template>
    <div class="p-6">
        <div class="mb-6">
            <h1 class="text-3xl font-bold text-gray-900">
                Gestion des Emplois
            </h1>
            <p class="text-gray-600 mt-2">
                Visualiser tous les emplois et leurs compétences associées
            </p>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="flex justify-center items-center py-12">
            <UIcon name="i-heroicons-arrow-path" class="animate-spin w-6 h-6" />
            <span class="ml-2">Chargement des emplois...</span>
        </div>

        <!-- Error State -->
        <UAlert v-else-if="error" icon="i-heroicons-exclamation-triangle" color="error" variant="soft"
            title="Erreur lors du chargement des emplois" :description="error" class="mb-6" />

        <!-- Search and Filters -->
        <UCard v-else class="mb-3">
            <template #header>
                <div class="flex items-center justify-between">
                    <div class="text-lg font-medium">Recherche</div>
                </div>
            </template>
            <div class="p-4 mt-4">
                <div class="flex gap-2 items-end">
                    <UFormField label="Rechercher (nom ou code)">
                        <UInput v-model="searchQuery" placeholder="Rechercher un emploi par nom ou code"
                            class="w-[420px]" />
                    </UFormField>
                    <UButton icon="i-heroicons-x-mark" color="neutral" variant="soft" :loading="loading"
                        @click="handleReset">
                        Réinitialiser
                    </UButton>
                </div>
            </div>
        </UCard>

        <!-- Jobs Table -->
        <JobsTable :jobs="filteredJobs" :loading="loading" :error="error" />
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Job } from '~/types/jobs'

// Meta
definePageMeta({
    middleware: 'auth',
    layout: 'default'
})

// Composables
const { jobs, loading, error, getJobs } = useJobs()

// Local state
const searchQuery = ref('')

// Client-side live filtering
const filteredJobs = computed<Job[]>(() => {
    const q = searchQuery.value.trim().toLowerCase()
    let list = jobs.value

    // Filter by search query (name or code)
    if (q.length > 0) {
        list = list.filter(job =>
            job.name.toLowerCase().includes(q) ||
            job.code.toLowerCase().includes(q)
        )
    }

    return list
})

// Actions
const handleReset = () => {
    searchQuery.value = ''
}

// Lifecycle
onMounted(async () => {
    try {
        await getJobs()
    } catch (err) {
        console.error('Échec du chargement des emplois:', err)
    }
})

// Head
useHead({
    title: 'Gestion des Emplois - Eiffage'
})
</script>
