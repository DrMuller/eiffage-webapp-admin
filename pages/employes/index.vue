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

        <!-- Loading State -->
        <div v-if="loading" class="flex justify-center items-center py-12">
            <UIcon name="i-heroicons-arrow-path" class="animate-spin w-6 h-6" />
            <span class="ml-2">Chargement des Employés...</span>
        </div>

        <!-- Error State -->
        <UAlert v-else-if="error" icon="i-heroicons-exclamation-triangle" color="error" variant="soft"
            title="Erreur lors du chargement des Employés" :description="error" class="mb-6" />

        <!-- Search input above the card -->
        <form v-else class="mb-3" @submit.prevent="handleSearch">
            <div class="flex flex-wrap items-center gap-2 mb-3">
                <UInput v-model="searchQuery" placeholder="Rechercher (nom, email, matricule, rôle)"
                    class="w-[420px]" />
            </div>
            <div class="flex flex-wrap items-center gap-2 ">
                <USelectMenu v-model="selectedJobIds" :items="jobsOptions" :value-key="'value'" multiple searchable
                    searchable-placeholder="Filtrer par emplois..." class="w-[420px]" placeholder="Emplois" />
                <USelectMenu v-model="selectedSkillIds" :items="filteredSkillsOptions" :value-key="'value'" multiple
                    searchable searchable-placeholder="Filtrer par compétences..." class="w-[380px]"
                    :placeholder="`Compétences (${filteredSkillsOptions.length})`"
                    :ui="{ itemLabel: 'overflow-visible text-ellipsis whitespace-wrap' }" />
                <UButton type="submit" color="secondary">Rechercher</UButton>
                <UButton icon="i-heroicons-x-mark" size="sm" color="secondary" variant="ghost" :loading="loading"
                    @click="handleReset">
                    Réinitialiser
                </UButton>
            </div>
        </form>

        <!-- Users Table -->
        <UsersTable :users="users" :jobs="jobs" :loading="loading" :error="error" title="Liste des Employés"
            :editable="true" @select="onSelect" @edit="viewUser" />

        <!-- Edit User Modal -->
        <UModal v-model:open="isEditModalOpen" :title="modalTitle">
            <template #body>
                <div class="p-6 flex justify-center">
                    <form class="space-y-4" @submit.prevent="handleUpdateUser">
                        <div>
                            <UFormField label="Prénom" required>
                                <UInput v-model="editForm.firstName" placeholder="Entrez le prénom" class="w-[340px]" />
                            </UFormField>
                        </div>

                        <div>
                            <UFormField label="Nom de famille" required>
                                <UInput v-model="editForm.lastName" placeholder="Entrez le nom de famille"
                                    class="w-[340px]" />
                            </UFormField>
                        </div>

                        <div>
                            <UFormField label="Matricule" required>
                                <UInput v-model="editForm.code" placeholder="Entrez le matricule" />
                            </UFormField>
                        </div>

                        <div>
                            <UFormField label="Manager">
                                <USelectMenu v-model="editForm.managerUserId" :items="managersFormatted"
                                    :value-key="'value'" searchable searchable-placeholder="Rechercher un manager..."
                                    class="w-[340px]" placeholder="Sélectionnez le manager" />
                            </UFormField>
                        </div>

                        <div>
                            <UFormField label="Emploi">
                                <USelectMenu v-model="editForm.jobId" :items="jobsFormatted" :value-key="'value'"
                                    searchable searchable-placeholder="Rechercher un emploi..." class="w-[340px]"
                                    placeholder="Sélectionnez un emploi" />
                            </UFormField>
                        </div>

                        <div>
                            <UFormField label="Rôles" required>
                                <USelect v-model="editForm.roles" :items="availableRoles" multiple class="w-[340px]"
                                    placeholder="Sélectionnez les rôles" />
                            </UFormField>
                        </div>

                        <div class="flex justify-end space-x-2 pt-4">
                            <UButton color="neutral" variant="soft" @click="isEditModalOpen = false">
                                Annuler
                            </UButton>
                            <UButton type="submit" color="secondary" :loading="loading">
                                Enregistrer
                            </UButton>
                        </div>
                    </form>
                </div>
            </template>
        </UModal>
    </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import type { User } from '~/types/auth'
import type { TableRow } from '@nuxt/ui'
import type { Skill } from '~/types/skills'
import type { Job } from '~/types/jobs'

// Meta
definePageMeta({
    middleware: ['auth', 'admin'],
    layout: 'default'
})

// Composables
const { users, managers, loading, error, getAllUsers, updateUser, getAllManagers, searchUsers } = useUsers()
const { jobs, getJobs } = useJobs()
const { skills, getSkills } = useSkills()
const { $api } = useNuxtApp()
const router = useRouter()
// Search state (backend-driven via button)
const searchQuery = ref('')
const selectedJobIds = ref<string[]>([])
const selectedSkillIds = ref<string[]>([])

function onSelect(row: TableRow<User>) {
    router.push(`/employes/${row.original._id}`)
}

const handleReset = () => {
    searchQuery.value = ''
    selectedJobIds.value = []
    selectedSkillIds.value = []
    handleSearch()
}

const handleSearch = async () => {
    const trimmed = searchQuery.value.trim()
    try {
        const jobIds = selectedJobIds.value
        const skillId = selectedSkillIds.value.length ? selectedSkillIds.value[0] : undefined
        const skillName = skillId ? skills.value.find((s: Skill) => s._id === skillId)?.name : undefined
        if (trimmed.length === 0 && jobIds.length === 0 && !skillName) {
            await getAllUsers()
        } else {
            await searchUsers({ q: trimmed || undefined, jobIds: jobIds.length ? jobIds : undefined, skillName })
        }
    } catch (err) {
        console.error('Search failed', err)
    }
}
const toast = useToast()

// Modal state
const isEditModalOpen = ref(false)
const editingUser = ref<User | null>(null)
const editForm = ref({
    firstName: '',
    lastName: '',
    code: '',
    roles: [] as string[],
    managerUserId: undefined as string | undefined,
    jobId: undefined as string | undefined,
})

// Available roles for selection
const availableRoles = [
    {
        label: 'MANAGER',
        value: 'MANAGER'
    },
    {
        label: 'ADMIN',
        value: 'ADMIN'
    }
]

const managersFormatted = computed(() => {
    return managers.value.map(manager => ({
        label: `${manager.firstName} ${manager.lastName} - ${manager.code}`,
        value: manager._id
    }))
})

const jobsFormatted = computed(() => {
    return jobs.value.map((job: Job) => ({
        label: `${job.name} (${job.code})`,
        value: job._id
    }))
})

const jobsOptions = computed(() => jobs.value.map((job: Job) => ({ label: job.name, value: job._id })))
const skillsOptions = computed(() => skills.value.map((s) => ({ label: s.name, value: s._id })))

// Cascading skills options based on selected jobs
const jobSkillsByJobId = ref<Record<string, string[]>>({})

async function ensureJobSkillsLoaded(jobId: string) {
    if (jobSkillsByJobId.value[jobId]) return
    const links = await $api<Array<{ skill: { _id: string; name: string } }>>(`/jobs/${jobId}/skills`, { method: 'GET' })
    jobSkillsByJobId.value[jobId] = links.map(l => l.skill._id)
}

watch(selectedJobIds, async (ids) => {
    // Load missing job skills for newly selected jobs
    await Promise.all(ids.map(ensureJobSkillsLoaded))
    // Remove selected skills that are no longer allowed
    const allowed = new Set<string>()
    if (ids.length > 0) {
        ids.forEach(id => {
            const arr = jobSkillsByJobId.value[id] || []
            arr.forEach(sid => allowed.add(sid))
        })
        selectedSkillIds.value = selectedSkillIds.value.filter(id => allowed.has(id))
    }
})

const filteredSkillsOptions = computed(() => {
    if (selectedJobIds.value.length === 0) return skillsOptions.value
    const allowed = new Set<string>()
    selectedJobIds.value.forEach(id => {
        const arr = jobSkillsByJobId.value[id] || []
        arr.forEach(sid => allowed.add(sid))
    })
    return skillsOptions.value.filter(opt => allowed.has(opt.value))
})

// Computed modal title
const modalTitle = computed(() => {
    return editingUser.value ? `${editingUser.value.firstName} ${editingUser.value.lastName}` : 'Modifier l\'Employé'
})

const viewUser = (user: User) => {
    editingUser.value = user
    editForm.value = {
        firstName: user.firstName,
        lastName: user.lastName,
        code: user.code,
        roles: [...user.roles],
        managerUserId: user.managerUserId ?? undefined,
        jobId: user.jobId ?? undefined
    }
    isEditModalOpen.value = true
}

const handleUpdateUser = async () => {
    if (!editingUser.value) return

    try {
        await updateUser(editingUser.value._id, {
            firstName: editForm.value.firstName,
            lastName: editForm.value.lastName,
            code: editForm.value.code,
            roles: editForm.value.roles,
            jobId: editForm.value.jobId ?? null,
            managerUserId: editForm.value.managerUserId ?? null,
        })

        toast.add({
            title: 'Employé mis à jour',
            description: `${editForm.value.firstName} ${editForm.value.lastName} a été mis à jour avec succès.`,
            color: 'success'
        })

        isEditModalOpen.value = false
        editingUser.value = null
    } catch (err) {
        toast.add({
            title: 'Erreur',
            description: 'Échec de la mise à jour de l\'Employé.',
            color: 'error'
        })
        console.error('Échec de la mise à jour de l\'Employé:', err)
    }
}

// Lifecycle
onMounted(async () => {
    try {
        await getAllUsers()
        await getAllManagers()
        await getJobs()
        await getSkills()
    } catch (err) {
        console.error('Échec du chargement des Employés:', err)
    }
})

// Head
useHead({
    title: 'Gestion des Employés - Eiffage'
})
</script>
