<template>
    <UCard variant="outline">
        <template #header>
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <span class="text-lg font-semibold">{{ title }}</span>
                    <UBadge color="info" variant="soft">
                        {{ paginationMeta ? paginationMeta.total : users.length }}
                    </UBadge>
                </div>
                <div v-if="paginationMeta && paginationMeta.totalPages > 1">
                    <UPagination v-model:page="currentPageModel" :total="paginationMeta.total"
                        :items-per-page="paginationMeta.limit" :sibling-count="1" show-edges show-controls />
                </div>
            </div>
        </template>

        <UTable v-model:sorting="sorting" :data="users" :columns="columns" @select="onSelect">
            <!-- Sortable headers -->
            <template #name-header="{ column }">
                <div class="inline-flex items-center gap-1 cursor-pointer select-none" @click="column.toggleSorting()">
                    <span>Nom</span>
                    <UIcon
                        :name="column.getIsSorted() === 'asc' ? 'i-heroicons-chevron-up' : column.getIsSorted() === 'desc' ? 'i-heroicons-chevron-down' : 'i-heroicons-chevron-up-down'"
                        class="w-4 h-4 text-gray-400" />
                </div>
            </template>
            <template #code-header="{ column }">
                <div class="inline-flex items-center gap-1 cursor-pointer select-none" @click="column.toggleSorting()">
                    <span>Matricule</span>
                    <UIcon
                        :name="column.getIsSorted() === 'asc' ? 'i-heroicons-chevron-up' : column.getIsSorted() === 'desc' ? 'i-heroicons-chevron-down' : 'i-heroicons-chevron-up-down'"
                        class="w-4 h-4 text-gray-400" />
                </div>
            </template>
            <template #email-header="{ column }">
                <div class="inline-flex items-center gap-1 cursor-pointer select-none" @click="column.toggleSorting()">
                    <span>Email</span>
                    <UIcon
                        :name="column.getIsSorted() === 'asc' ? 'i-heroicons-chevron-up' : column.getIsSorted() === 'desc' ? 'i-heroicons-chevron-down' : 'i-heroicons-chevron-up-down'"
                        class="w-4 h-4 text-gray-400" />
                </div>
            </template>
            <template #roles-header="{ column }">
                <div class="inline-flex items-center gap-1 cursor-pointer select-none" @click="column.toggleSorting()">
                    <span>Rôles</span>
                    <UIcon
                        :name="column.getIsSorted() === 'asc' ? 'i-heroicons-chevron-up' : column.getIsSorted() === 'desc' ? 'i-heroicons-chevron-down' : 'i-heroicons-chevron-up-down'"
                        class="w-4 h-4 text-gray-400" />
                </div>
            </template>
            <template #job-header="{ column }">
                <div class="inline-flex items-center gap-1 cursor-pointer select-none" @click="column.toggleSorting()">
                    <span>Emploi</span>
                    <UIcon
                        :name="column.getIsSorted() === 'asc' ? 'i-heroicons-chevron-up' : column.getIsSorted() === 'desc' ? 'i-heroicons-chevron-down' : 'i-heroicons-chevron-up-down'"
                        class="w-4 h-4 text-gray-400" />
                </div>
            </template>
            <template #name-cell="{ row }">
                <div class="font-medium text-gray-900 dark:text-white">
                    {{ row.original.firstName }} {{ row.original.lastName }}
                </div>
            </template>

            <template #code-cell="{ row }">
                <div class="text-sm text-gray-500 dark:text-gray-400">
                    {{ row.original.code }}
                </div>
            </template>

            <template #email-cell="{ row }">
                <div class="text-gray-900 dark:text-white">
                    {{ row.original.email }}
                </div>
            </template>

            <template #job-cell="{ row }">
                <div class="text-gray-900 dark:text-white">
                    {{row.original.jobId ? jobs.find((j) => j._id === row.original.jobId)?.name : '—'}}
                </div>
            </template>

            <template #roles-cell="{ row }">
                <div class="flex flex-wrap gap-1">
                    <UBadge
                        v-for="role in row.original.roles.sort((a, b) => a > b ? 1 : -1).filter((r: string) => r !== 'USER')"
                        :key="role" :label="role" :variant="getRoleVariant(role)" :color="getRoleColor(role)"
                        size="sm" />
                </div>
            </template>

            <template v-if="showInviteFeatures" #inviteStatus-cell="{ row }">
                <div class="flex items-center gap-2">
                    <UBadge v-if="row.original.invitedAt" label="Invité" color="success" variant="soft" size="sm" />
                    <UBadge v-else label="Non invité" color="warning" variant="soft" size="sm" />
                </div>
            </template>

            <template v-if="showInviteFeatures" #invite-cell="{ row }">
                <div class="flex justify-center">
                    <UButton icon="i-heroicons-envelope" size="sm" color="secondary" variant="ghost"
                        aria-label="Inviter l'utilisateur" @click.stop="openInviteModal(row.original)">
                        Inviter
                    </UButton>
                </div>
            </template>

            <template #details-cell="{ row }">
                <div class="flex justify-end">
                    <UButton icon="fluent:eye-16-regular" size="sm" color="neutral" variant="ghost"
                        aria-label="Voir l'Employé" @click.stop="router.push(`/employes/${row.original._id}`)">
                        Détails
                    </UButton>
                </div>
            </template>

            <template v-if="editable" #edit-cell="{ row }">
                <div class="flex justify-end">
                    <UButton icon="fluent:edit-16-regular" size="sm" color="neutral" variant="ghost"
                        aria-label="Modifier" @click.stop="$emit('edit', row.original)">
                        Modifier
                    </UButton>
                </div>
            </template>
        </UTable>

        <div v-if="users.length === 0 && !loading && !error" class="text-center py-12">
            <UIcon name="i-heroicons-users" class="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Aucun
            </h3>
        </div>

        <template v-if="paginationMeta && paginationMeta.totalPages > 1" #footer>
            <div class="flex items-center justify-between">
                <div class="text-sm text-gray-500">
                    Page {{ paginationMeta.page }} sur {{ paginationMeta.totalPages }}
                    ({{ paginationMeta.total }} résultat{{ paginationMeta.total > 1 ? 's' : '' }})
                </div>
                <UPagination v-model:page="currentPageModel" :total="paginationMeta.total"
                    :items-per-page="paginationMeta.limit" :sibling-count="1" show-edges show-controls />
            </div>
        </template>
    </UCard>

    <!-- Invite Modal -->
    <UModal v-model:open="isInviteModalOpen" title="Inviter l'utilisateur">
        <template #body>
            <div class="p-6">
                <div class="mb-6">
                    <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Vous êtes sur le point d'inviter :
                    </p>
                    <p class="font-medium text-gray-900 dark:text-white">
                        {{ selectedUserForInvite?.firstName }} {{ selectedUserForInvite?.lastName }}
                    </p>
                    <p class="text-sm text-gray-500 dark:text-gray-400">
                        {{ selectedUserForInvite?.email }}
                    </p>
                </div>

                <div class="space-y-3">
                    <p class="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Sélectionnez le rôle à attribuer :
                    </p>

                    <div class="space-y-2">
                        <button type="button"
                            class="w-full p-4 border-2 rounded-lg transition-all hover:border-secondary-500 focus:outline-none focus:ring-2 focus:ring-secondary-500"
                            :class="selectedRole === 'ADMIN' ? 'border-secondary-500 bg-secondary-50 dark:bg-secondary-900/20' : 'border-gray-200 dark:border-gray-700'"
                            @click="selectedRole = 'ADMIN'">
                            <div class="flex items-center justify-between">
                                <div class="text-left">
                                    <div class="font-medium text-gray-900 dark:text-white">RH (Administrateur)</div>
                                    <div class="text-sm text-gray-500 dark:text-gray-400">Accès complet à la plateforme
                                    </div>
                                </div>
                                <UIcon name="i-heroicons-check-circle" class="w-6 h-6 transition-colors"
                                    :class="selectedRole === 'ADMIN' ? 'text-secondary-500' : 'text-gray-300 dark:text-gray-600'" />
                            </div>
                        </button>

                        <button type="button"
                            class="w-full p-4 border-2 rounded-lg transition-all hover:border-secondary-500 focus:outline-none focus:ring-2 focus:ring-secondary-500"
                            :class="selectedRole === 'MANAGER' ? 'border-secondary-500 bg-secondary-50 dark:bg-secondary-900/20' : 'border-gray-200 dark:border-gray-700'"
                            @click="selectedRole = 'MANAGER'">
                            <div class="flex items-center justify-between">
                                <div class="text-left">
                                    <div class="font-medium text-gray-900 dark:text-white">Manager</div>
                                    <div class="text-sm text-gray-500 dark:text-gray-400">Gestion d'équipe et
                                        évaluations</div>
                                </div>
                                <UIcon name="i-heroicons-check-circle" class="w-6 h-6 transition-colors"
                                    :class="selectedRole === 'MANAGER' ? 'text-secondary-500' : 'text-gray-300 dark:text-gray-600'" />
                            </div>
                        </button>
                    </div>
                </div>

                <div class="flex justify-end gap-2 pt-6">
                    <UButton color="neutral" variant="soft" @click="closeInviteModal">
                        Annuler
                    </UButton>
                    <UButton color="secondary" :disabled="!selectedRole" :loading="inviteLoading" @click="handleInvite">
                        Envoyer l'invitation
                    </UButton>
                </div>
            </div>
        </template>
    </UModal>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { TableColumn, TableRow } from '@nuxt/ui'
import type { User } from '~/types/auth'
import type { Job } from '~/types/jobs'
const router = useRouter()

export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

const props = withDefaults(defineProps<{
    users: User[]
    jobs: Job[]
    loading?: boolean
    error?: string | null
    title?: string
    editable?: boolean
    showRoles?: boolean
    showInviteFeatures?: boolean
    paginationMeta?: PaginationMeta | null
    currentPage?: number
}>(), {
    loading: false,
    error: null,
    title: 'Liste des Employés',
    showRoles: true,
    showInviteFeatures: false,
    paginationMeta: null,
    currentPage: 1,
})

const emit = defineEmits<{
    (e: 'page-change', page: number): void
    (e: 'edit', user: User): void
    (e: 'invite', userId: string, role: 'ADMIN' | 'MANAGER'): void
}>()

const sorting = ref([])
const isInviteModalOpen = ref(false)
const selectedUserForInvite = ref<User | null>(null)
const selectedRole = ref<'ADMIN' | 'MANAGER' | null>(null)
const inviteLoading = ref(false)

const currentPageModel = ref(props.currentPage)

// Watch for prop changes and update local ref
watch(() => props.currentPage, (newPage) => {
    currentPageModel.value = newPage
})

// Watch for local ref changes and emit event
watch(currentPageModel, (newPage) => {
    if (newPage !== props.currentPage) {
        emit('page-change', newPage)
    }
})

const columns = computed<TableColumn<User>[]>(() => {

    const cols: TableColumn<User>[] = []
    if (props.showRoles) {
        cols.push({
            id: 'roles',
            header: 'Rôles',
            accessorFn: (row) => Array.isArray(row.roles) ? row.roles.join(', ') : '',
            enableSorting: true,
            meta: { class: { th: 'text-left' } },
        })
    }

    cols.push(
        {
            id: 'name',
            header: 'Nom',
            accessorFn: (row) => `${row.firstName} ${row.lastName}`,
            enableSorting: true,
            meta: { class: { th: 'text-left' } },
        },
        {
            accessorKey: 'code',
            header: 'Matricule',
            enableSorting: true,
            meta: { class: { th: 'text-left' } },
        },
        {
            accessorKey: 'email',
            header: 'Email',
            enableSorting: true,
            meta: { class: { th: 'text-left' } },
        },
        {
            id: 'job',
            header: 'Emploi',
            accessorFn: (row) => {
                const match = props.jobs.find((j) => j._id === row.jobId)
                return match ? match.name : ''
            },
            enableSorting: true,
            meta: { class: { th: 'text-left' } },
        },
    )

    if (props.showInviteFeatures) {
        cols.push(
            {
                id: 'inviteStatus',
                header: 'Statut',
                accessorFn: (row) => row.invitedAt ? 'Invité' : 'Non invité',
                enableSorting: true,
                meta: { class: { th: 'text-left w-[130px]', td: 'w-[130px]' } },
            },
            {
                accessorKey: 'invite',
                header: '',
                enableSorting: false,
                meta: { class: { th: 'text-center w-[110px]', td: 'w-[110px]' } },
            },
        )
    }

    cols.push(
        {
            accessorKey: 'details',
            header: '',
            enableSorting: false,
            meta: { class: { th: 'text-center w-[120px]', td: 'w-[120px]' } },
        },
    )

    if (props.editable) {
        cols.push({
            accessorKey: 'edit',
            header: '',
            enableSorting: false,
            meta: { class: { th: 'text-center w-[120px]', td: 'w-[120px]' } },
        })
    }

    return cols
})

function onSelect(row: TableRow<User>) {
    router.push(`/employes/${row.original._id}`)
}

function getRoleColor(role: string) {
    switch (role) {
        case 'ADMIN':
            return 'secondary'
        case 'MANAGER':
            return 'secondary'
        case 'RH':
            return 'neutral'
        case 'USER':
            return 'neutral'
        default:
            return 'neutral'
    }
}

function getRoleVariant(role: string): 'solid' | 'outline' | 'soft' {
    switch (role) {
        case 'ADMIN':
            return 'solid'
        case 'MANAGER':
            return 'soft'
        case 'RH':
            return 'soft'
        case 'USER':
            return 'soft'
        default:
            return 'outline'
    }
}

function openInviteModal(user: User) {
    selectedUserForInvite.value = user
    selectedRole.value = null
    isInviteModalOpen.value = true
}

function closeInviteModal() {
    isInviteModalOpen.value = false
    selectedUserForInvite.value = null
    selectedRole.value = null
    inviteLoading.value = false
}

async function handleInvite() {
    if (!selectedUserForInvite.value || !selectedRole.value) return

    inviteLoading.value = true
    emit('invite', selectedUserForInvite.value._id, selectedRole.value)
    // Note: The parent component should handle success/error and close the modal
    // We'll close it after a short delay to allow for feedback
    setTimeout(() => {
        closeInviteModal()
    }, 500)
}
</script>
