<template>
    <UCard variant="outline">
        <template #header>
            <div class="flex items-center gap-3">
                <span class="text-lg font-semibold">{{ title }}</span>
                <UBadge color="info" variant="soft">{{ users.length }}</UBadge>
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

            <template #details-cell="{ row }">
                <div class="flex justify-end">
                    <UButton icon="fluent:eye-16-regular" size="sm" color="neutral" variant="ghost"
                        aria-label="Voir l'Employé" @click="router.push(`/employes/${row.original._id}`)">
                        Détails
                    </UButton>
                </div>
            </template>

            <template v-if="editable" #edit-cell="{ row }">
                <div class="flex justify-end">
                    <UButton icon="fluent:edit-16-regular" size="sm" color="neutral" variant="ghost"
                        aria-label="Modifier" @click="$emit('edit', row.original)">
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
    </UCard>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import type { User } from '~/types/auth'
import type { Job } from '~/types/jobs'
const router = useRouter()

const props = withDefaults(defineProps<{
    users: User[]
    jobs: Job[]
    loading?: boolean
    error?: string | null
    title?: string
    editable?: boolean
    showRoles?: boolean
}>(), {
    loading: false,
    error: null,
    title: 'Liste des Employés',
    showRoles: true,
})

// const emit = defineEmits<{
//     (e: 'select', row: TableRow<User>): void
//     (e: 'edit', user: User): void
// }>()

const sorting = ref([])

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

function onSelect() {
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
</script>
