<template>
    <div class="p-6">
        <div class="mb-6">
            <h1 class="text-3xl font-bold text-gray-900">
                Gestion des Habilitations
            </h1>
            <p class="text-gray-600 mt-2">
                Gérer et visualiser toutes les habilitations du système
            </p>
        </div>

        <!-- Error State (non-blocking for search UI) -->
        <UAlert v-if="error" icon="i-heroicons-exclamation-triangle" color="error" variant="soft"
            title="Erreur lors du chargement des habilitations" :description="error" class="mb-6" />

        <!-- Search component - stays mounted during loading -->
        <HabilitationsSearch :loading="loading" class="mb-6" @search="onSearch" />

        <!-- Habilitations Table -->
        <HabilitationsTable :habilitations="habilitations" :users="users" :jobs="jobs" :loading="loading" :error="error"
            :pagination-meta="paginationMeta" :current-page="currentPage" title="Liste des Habilitations"
            @page-change="onPageChange" />

    </div>
</template>

<script setup lang="ts">
import HabilitationsSearch from '~/components/Habilitations/HabilitationsSearch.vue'
import HabilitationsTable from '~/components/Habilitations/HabilitationsTable.vue'

// Meta
definePageMeta({
    middleware: ['auth', 'admin-or-manager'],
    layout: 'default'
})

// Composables
const { habilitations, loading, error, paginationMeta, searchHabilitations } = useHabilitations()
const { jobs, getJobs } = useJobs()
const { users, getAllUsers } = useUsers()

// Local state
const currentPage = ref(1)
const pageSize = ref(50)
const currentFilters = ref<{
    q?: string;
    userIds?: string[];
    jobIds?: string[];
    startDateFrom?: string;
    endDateTo?: string;
} | null>(null)

async function onSearch(payload: {
    q?: string;
    userIds?: string[];
    jobIds?: string[];
    startDateFrom?: string;
    endDateTo?: string;
}) {
    currentFilters.value = payload
    currentPage.value = 1 // Reset to first page on new search
    await performSearch()
}

async function performSearch() {
    const { q, userIds, jobIds, startDateFrom, endDateTo } = currentFilters.value || {}

    await searchHabilitations({
        q,
        userIds,
        jobIds,
        startDateFrom,
        endDateTo,
        page: currentPage.value,
        limit: pageSize.value
    })

    // Sync currentPage with the actual page from the server response
    if (paginationMeta.value) {
        currentPage.value = paginationMeta.value.page
    }
}

async function onPageChange(page: number) {
    currentPage.value = page
    await performSearch()
}

// Lifecycle
onMounted(async () => {
    try {
        const today = new Date().toISOString().split('T')[0]
        currentFilters.value = { endDateTo: today }
        await Promise.all([
            searchHabilitations({
                endDateTo: today,
                page: currentPage.value,
                limit: pageSize.value
            }),
            getJobs(),
            getAllUsers()
        ])
    } catch (err) {
        console.error('Échec du chargement des habilitations:', err)
    }
})

// Head
useHead({
    title: 'Gestion des Habilitations - Eiffage'
})
</script>
