<template>
    <div class="p-6">
        <div class="mb-6">
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
                Gestion des Compétences
            </h1>
            <p class="text-gray-600 dark:text-gray-400 mt-2">
                Gérer et visualiser toutes les Compétences du système
            </p>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="flex justify-center items-center py-12">
            <UIcon name="i-heroicons-arrow-path" class="animate-spin w-6 h-6" />
            <span class="ml-2">Chargement des Compétences...</span>
        </div>

        <!-- Error State -->
        <UAlert v-else-if="error" icon="i-heroicons-exclamation-triangle" color="error" variant="soft"
            title="Erreur lors du chargement des Compétences" :description="error" class="mb-6" />

        <!-- Search and Filters -->
        <div v-else class="mb-3">
            <div class="flex flex-wrap items-center gap-2 mb-3">
                <UInput v-model="searchQuery" placeholder="Rechercher une compétence par nom (live)"
                    class="w-[420px]" />
            </div>
            <div class="flex flex-wrap items-center gap-2 ">
                <USelectMenu v-model="selectedJobIds" :items="jobsOptions" :value-key="'value'" multiple searchable
                    searchable-placeholder="Filtrer par emplois..." class="w-[420px]" placeholder="Emplois" />
                <UButton icon="i-heroicons-x-mark" size="sm" color="secondary" variant="ghost" :loading="loading"
                    @click="handleReset">
                    Réinitialiser
                </UButton>
            </div>
        </div>

        <!-- Skills Table -->
        <SkillsTable :skills="filteredSkills" :loading="loading" :error="error" title="Liste des Compétences"
            @refresh="handleRefresh" />
    </div>

</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import type { Skill } from '~/types/skills'
import type { Job } from '~/types/jobs'
import SkillsTable from '~/components/Skills/SkillsTable.vue'

// Meta
definePageMeta({
    middleware: 'auth',
    layout: 'default'
})

// Composables
const { skills, loading, error, getSkills } = useSkills()
const { jobs, getJobs } = useJobs()
const { $api } = useNuxtApp()

// Local state
const searchQuery = ref('')
const selectedJobIds = ref<string[]>([])

// Jobs select options
const jobsOptions = computed(() => jobs.value.map((job: Job) => ({ label: job.name, value: job._id })))

// Job -> Skill links cache
const jobSkillsByJobId = ref<Record<string, string[]>>({})

async function ensureJobSkillsLoaded(jobId: string) {
    if (jobSkillsByJobId.value[jobId]) return
    const links = await $api<Array<{ skill: { _id: string; name: string } }>>(`/jobs/${jobId}/skills`, { method: 'GET' })
    jobSkillsByJobId.value[jobId] = links.map(l => l.skill._id)
}

watch(selectedJobIds, async (ids) => {
    if (Array.isArray(ids) && ids.length > 0) {
        await Promise.all(ids.map(id => ensureJobSkillsLoaded(id)))
    }
})

// Client-side live filtering
const filteredSkills = computed<Skill[]>(() => {
    const q = searchQuery.value.trim().toLowerCase()
    let list = skills.value
    if (q.length > 0) {
        list = list.filter(s => s.name.toLowerCase().includes(q))
    }
    if (selectedJobIds.value && selectedJobIds.value.length > 0) {
        const union: string[] = selectedJobIds.value.flatMap(id => jobSkillsByJobId.value[id] || [])
        const allowedIds = new Set(union)
        list = list.filter(s => allowedIds.has(s._id))
    }
    return list
})

// Columns now provided by SkillsTable component

// Actions
const handleRefresh = async () => {
    try {
        await getSkills()
    } catch (err) {
        console.error('Échec de l\'actualisation des Compétences:', err)
    }
}

const handleReset = () => {
    searchQuery.value = ''
    selectedJobIds.value = []
}

// Lifecycle
onMounted(async () => {
    try {
        await Promise.all([
            getSkills(),
            getJobs('')
        ])
    } catch (err) {
        console.error('Échec du chargement des Compétences:', err)
    }
})

// Head
useHead({
    title: 'Gestion des Compétences - Eiffage'
})
</script>
