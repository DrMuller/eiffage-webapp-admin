<template>
    <div>
        <!-- Search Card -->
        <UCard class="max-w-[800px]">
            <template #header>
                <div class="flex items-center justify-between">
                    <div class="text-lg font-medium">Recherche</div>
                </div>
            </template>
            <div class="p-4 mt-4">
                <div class="grid grid-cols-12 gap-4">
                    <!-- Row 1: 12 (full width) -->
                    <UFormField label="Rechercher (code, label, type)" class="col-span-12">
                        <UInput v-model="searchQuery" placeholder="Rechercher (code, label, type)" class="w-full"
                            @keyup.enter="submitSearch" />
                    </UFormField>

                    <!-- Row 2: 6 / 6 -->
                    <UFormField label="Emplois" class="col-span-6">
                        <USelectMenu v-model="selectedJobIds" :items="jobsOptions" :value-key="'value'" multiple
                            searchable searchable-placeholder="Filtrer par emplois..." class="w-full"
                            placeholder="Emplois" />
                    </UFormField>
                    <UFormField label="Employés" class="col-span-6">
                        <USelectMenu v-model="selectedUserIds" :items="usersOptions" :value-key="'value'" multiple
                            searchable searchable-placeholder="Filtrer par employés..." class="w-full"
                            placeholder="Employés" />
                    </UFormField>

                    <!-- Row 3: 6 / 6 -->
                    <UFormField label="Date de début (à partir de)" class="col-span-6">
                        <UInput v-model="startDateFrom" type="date" class="w-full" @keyup.enter="submitSearch" />
                    </UFormField>
                    <UFormField label="Date de fin (jusqu'à)" class="col-span-6">
                        <UInput v-model="endDateTo" type="date" class="w-full" @keyup.enter="submitSearch" />
                    </UFormField>
                </div>
            </div>
            <template #footer>
                <div class="flex gap-2 justify-end">
                    <UButton color="secondary" variant="solid" @click="submitSearch">Rechercher</UButton>
                    <UButton icon="i-heroicons-x-mark" color="neutral" variant="soft" :loading="loading"
                        @click="handleReset">
                        Réinitialiser
                    </UButton>
                </div>
            </template>
        </UCard>
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const emit = defineEmits<{
    (e: 'search', payload: {
        q?: string;
        userIds?: string[];
        jobIds?: string[];
        startDateFrom?: string;
        endDateTo?: string;
    }): void
}>()

defineProps<{ loading?: boolean }>()

// Composables (self-contained data)
const { jobs, getJobs } = useJobs()
const { users, getAllUsers } = useUsers()

// Local state
const searchQuery = ref('')
const selectedJobIds = ref<string[]>([])
const selectedUserIds = ref<string[]>([])
const startDateFrom = ref('')
const endDateTo = ref(new Date().toISOString().split('T')[0])

// Options
const jobsOptions = computed(() => jobs.value.map((j) => ({ label: j.name, value: j._id })))
const usersOptions = computed(() => users.value.map((u) => ({
    label: `${u.firstName} ${u.lastName} (${u.code})`,
    value: u._id
})))

function submitSearch() {
    const trimmed = searchQuery.value.trim()
    emit('search', {
        q: trimmed || undefined,
        userIds: selectedUserIds.value.length ? selectedUserIds.value : undefined,
        jobIds: selectedJobIds.value.length ? selectedJobIds.value : undefined,
        startDateFrom: startDateFrom.value || undefined,
        endDateTo: endDateTo.value || undefined,
    })
}

function handleReset() {
    searchQuery.value = ''
    selectedJobIds.value = []
    selectedUserIds.value = []
    startDateFrom.value = ''
    endDateTo.value = ''
    submitSearch()
}

onMounted(async () => {
    await Promise.all([
        getJobs(),
        getAllUsers()
    ])
})
</script>
