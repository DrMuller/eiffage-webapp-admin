<template>
    <div class="p-6">
        <div class="mb-6">
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
                Gestion des Employés
            </h1>
            <p class="text-gray-600 dark:text-gray-400 mt-2">
                Gérer et visualiser tous les Employés du système
            </p>
        </div>

        <!-- Error State (non-blocking for search UI) -->
        <UAlert v-if="error" icon="i-heroicons-exclamation-triangle" color="error" variant="soft"
            title="Erreur lors du chargement des Employés" :description="error" class="mb-6" />

        <!-- Search (both parts) extracted component - stays mounted during loading -->
        <EmployeesSearch :loading="loading" class="mb-6" @search="onSearch" />

        <!-- Employees Table -->
        <UsersEmployeesTable :users="users" :jobs="jobs" :loading="loading" :error="error" title="Liste des Employés"
            :pagination-meta="paginationMeta" :current-page="currentPage" @page-change="onPageChange" />

    </div>
</template>

<script setup lang="ts">
import EmployeesSearch from '~/components/Users/EmployeesSearch.vue'

// Meta
definePageMeta({
    middleware: ['auth', 'admin-or-manager'],
    layout: 'default'
})

// Composables
const { users, loading, error, paginationMeta, getAllManagers, searchUsers } = useUsers()
const { jobs, getJobs } = useJobs()

// Local state
const currentPage = ref(1)
const pageSize = ref(50)
const currentFilters = ref<{
    q?: string;
    jobIds?: string[];
    skills?: Array<{ skillId: string; minLevel: number }>;
    gender?: 'MALE' | 'FEMALE';
    establishmentName?: string;
    ageMin?: number;
    ageMax?: number;
    seniorityMin?: number;
    seniorityMax?: number;
} | null>(null)

async function onSearch(payload: {
    q?: string;
    jobIds?: string[];
    skills?: Array<{ skillId: string; minLevel: number }>;
    gender?: 'MALE' | 'FEMALE';
    establishmentName?: string;
    ageMin?: number;
    ageMax?: number;
    seniorityMin?: number;
    seniorityMax?: number;
}) {
    currentFilters.value = payload
    currentPage.value = 1 // Reset to first page on new search
    await performSearch()
}

async function performSearch() {
    const { q, jobIds, skills, gender, establishmentName, ageMin, ageMax, seniorityMin, seniorityMax } = currentFilters.value || {}

    await searchUsers({
        q,
        jobIds,
        skills,
        gender,
        establishmentName,
        ageMin,
        ageMax,
        seniorityMin,
        seniorityMax,
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

// search UI removed; handled in EmployeesSearch

// Lifecycle
onMounted(async () => {
    try {
        await Promise.all([
            searchUsers({ page: currentPage.value, limit: pageSize.value }),
            getAllManagers(),
            getJobs()
        ])
    } catch (err) {
        console.error('Échec du chargement des Employés:', err)
    }
})

// Head
useHead({
    title: 'Gestion des Employés - Eiffage'
})
</script>
