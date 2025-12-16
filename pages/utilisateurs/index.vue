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
                <UButton type="submit" color="secondary" :loading="loading">
                    Rechercher
                </UButton>
                <UButton type="button" color="secondary" variant="outline" @click="handleReset">Réinitialiser</UButton>
            </div>
        </form>

        <!-- Users Table -->
        <UsersTable :users="users" :jobs="jobs" :loading="loading" :error="error" title="Liste des Employés"
            :editable="true" :show-invite-features="true" :pagination-meta="paginationMeta" :current-page="currentPage"
            @select="onSelect" @edit="viewUser" @page-change="onPageChange" @invite="handleInviteUser" />

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
                            <UFormField label="Managers">
                                <USelectMenu v-model="editForm.managerUserIds" :items="managersFormatted"
                                    :value-key="'value'" multiple searchable
                                    searchable-placeholder="Rechercher un manager..." class="w-[340px]"
                                    placeholder="Sélectionnez les managers" />
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
import { computed } from 'vue'
import type { User } from '~/types/auth'
import type { TableRow } from '@nuxt/ui'
import type { Job } from '~/types/jobs'

// Meta
definePageMeta({
    middleware: ['auth', 'admin'],
    layout: 'default'
})

// Composables
const { users, managers, loading, error, paginationMeta, updateUser, getAllManagers, searchUsers, inviteUser } = useUsers()
const { jobs, getJobs } = useJobs()
const $router = useRouter()

// Pagination state
const currentPage = ref(1)
const pageSize = ref(50)
const currentFilters = ref<{ q?: string } | null>(null)

// Search state (backend-driven via button)
const searchQuery = ref('')

function onSelect(row: TableRow<User>) {
    $router.push(`/employes/${row.original._id}`)
}

const handleReset = () => {
    searchQuery.value = ''
    handleSearch()
}

const handleSearch = async () => {
    const trimmed = searchQuery.value.trim()
    currentFilters.value = { q: trimmed || undefined }
    currentPage.value = 1 // Reset to first page on new search
    await performSearch()
}

async function performSearch() {
    const { q } = currentFilters.value || {}
    try {
        if (!q) {
            await getAllUsers({ page: currentPage.value, limit: pageSize.value })
        } else {
            await searchUsers({ q, page: currentPage.value, limit: pageSize.value })
        }

        // Sync currentPage with the actual page from the server response
        if (paginationMeta.value) {
            currentPage.value = paginationMeta.value.page
        }
    } catch (err) {
        console.error('Search failed', err)
    }
}

async function onPageChange(page: number) {
    currentPage.value = page
    await performSearch()
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
    managerUserIds: [] as string[],
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
        label: `${job.name} - ${job.code}`,
        value: job._id
    }))
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
        managerUserIds: user.managerUserIds ? [...user.managerUserIds] : [],
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
            managerUserIds: editForm.value.managerUserIds,
        })

        toast.add({
            title: 'Employé mis à jour',
            description: `${editForm.value.firstName} ${editForm.value.lastName} a été mis à jour avec succès.`,
            color: 'success'
        })

        // Refresh the users list to ensure it's up to date
        await performSearch()

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

const handleInviteUser = async (userId: string, role: 'ADMIN' | 'MANAGER') => {
    try {
        const emailContent = await inviteUser(userId, role)

        const user = users.value.find(u => u._id === userId)
        const userName = user ? `${user.firstName} ${user.lastName}` : 'l\'utilisateur'
        const roleLabel = role === 'ADMIN' ? 'RH (Administrateur)' : 'Manager'

        // Open mailto link with prefilled content
        const mailtoLink = `mailto:${emailContent.to}?subject=${encodeURIComponent(emailContent.subject)}&body=${encodeURIComponent(emailContent.body)}`
        window.open(mailtoLink, '_blank')

        toast.add({
            title: 'Invitation préparée',
            description: `L'invitation pour ${userName} avec le rôle ${roleLabel} a été préparée. Veuillez envoyer l'email depuis votre client.`,
            color: 'success'
        })
        
        await performSearch() // Refresh user list to show updated roles/invite status
    } catch (err) {
        toast.add({
            title: 'Erreur',
            description: 'Échec de la préparation de l\'invitation.',
            color: 'error'
        })
        console.error('Échec de la préparation de l\'invitation:', err)
    }
}

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
