<template>
    <UCard variant="outline">
        <template #header>
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <span class="text-lg font-semibold">{{ title }}</span>
                    <UBadge color="info" variant="soft">
                        {{ paginationMeta ? paginationMeta.total : habilitations.length }}
                    </UBadge>
                </div>
                <div>
                    <UPagination v-model:page="currentPageModel" :total="paginationMeta?.total"
                        :items-per-page="paginationMeta?.limit" :sibling-count="1" show-edges show-controls />
                </div>
            </div>
        </template>

        <UTable v-model:sorting="sorting" :data="habilitations" :columns="columns" @select="onSelect">
            <!-- Sortable headers -->
            <template #code-header="{ column }">
                <div class="inline-flex items-center gap-1 cursor-pointer select-none" @click="column.toggleSorting()">
                    <span>Code</span>
                    <UIcon
                        :name="column.getIsSorted() === 'asc' ? 'i-heroicons-chevron-up' : column.getIsSorted() === 'desc' ? 'i-heroicons-chevron-down' : 'i-heroicons-chevron-up-down'"
                        class="w-4 h-4 text-gray-400" />
                </div>
            </template>
            <template #status-header="{ column }">
                <div class="inline-flex items-center gap-1 cursor-pointer select-none" @click="column.toggleSorting()">
                    <span>Statut</span>
                    <UIcon
                        :name="column.getIsSorted() === 'asc' ? 'i-heroicons-chevron-up' : column.getIsSorted() === 'desc' ? 'i-heroicons-chevron-down' : 'i-heroicons-chevron-up-down'"
                        class="w-4 h-4 text-gray-400" />
                </div>
            </template>
            <template #label-header="{ column }">
                <div class="inline-flex items-center gap-1 cursor-pointer select-none" @click="column.toggleSorting()">
                    <span>Label</span>
                    <UIcon
                        :name="column.getIsSorted() === 'asc' ? 'i-heroicons-chevron-up' : column.getIsSorted() === 'desc' ? 'i-heroicons-chevron-down' : 'i-heroicons-chevron-up-down'"
                        class="w-4 h-4 text-gray-400" />
                </div>
            </template>
            <template #type-header="{ column }">
                <div class="inline-flex items-center gap-1 cursor-pointer select-none" @click="column.toggleSorting()">
                    <span>Type</span>
                    <UIcon
                        :name="column.getIsSorted() === 'asc' ? 'i-heroicons-chevron-up' : column.getIsSorted() === 'desc' ? 'i-heroicons-chevron-down' : 'i-heroicons-chevron-up-down'"
                        class="w-4 h-4 text-gray-400" />
                </div>
            </template>
            <template #user-header="{ column }">
                <div class="inline-flex items-center gap-1 cursor-pointer select-none" @click="column.toggleSorting()">
                    <span>Employé</span>
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
            <template #establishment-header="{ column }">
                <div class="inline-flex items-center gap-1 cursor-pointer select-none" @click="column.toggleSorting()">
                    <span>Établissement</span>
                    <UIcon
                        :name="column.getIsSorted() === 'asc' ? 'i-heroicons-chevron-up' : column.getIsSorted() === 'desc' ? 'i-heroicons-chevron-down' : 'i-heroicons-chevron-up-down'"
                        class="w-4 h-4 text-gray-400" />
                </div>
            </template>
            <template #startDate-header="{ column }">
                <div class="inline-flex items-center gap-1 cursor-pointer select-none" @click="column.toggleSorting()">
                    <span>Date de début</span>
                    <UIcon
                        :name="column.getIsSorted() === 'asc' ? 'i-heroicons-chevron-up' : column.getIsSorted() === 'desc' ? 'i-heroicons-chevron-down' : 'i-heroicons-chevron-up-down'"
                        class="w-4 h-4 text-gray-400" />
                </div>
            </template>
            <template #endDate-header="{ column }">
                <div class="inline-flex items-center gap-1 cursor-pointer select-none" @click="column.toggleSorting()">
                    <span>Date de fin</span>
                    <UIcon
                        :name="column.getIsSorted() === 'asc' ? 'i-heroicons-chevron-up' : column.getIsSorted() === 'desc' ? 'i-heroicons-chevron-down' : 'i-heroicons-chevron-up-down'"
                        class="w-4 h-4 text-gray-400" />
                </div>
            </template>

            <!-- Cell templates -->
            <template #code-cell="{ row }">
                <div class="text-sm text-gray-900 font-medium">
                    {{ row.original.code }}
                </div>
            </template>

            <template #status-cell="{ row }">
                <UBadge
                    :label="isExpired(row.original.endDate) ? 'Expirée' : 'Valide'"
                    :color="isExpired(row.original.endDate) ? 'error' : 'info'"
                    variant="subtle"
                    size="sm"
                />
            </template>

            <template #label-cell="{ row }">
                <div class="text-sm text-gray-900 w-[300px]">
                    <div class="truncate">
                        {{ row.original.label }}
                    </div>
                </div>
            </template>

            <template #type-cell="{ row }">
                <UBadge :label="row.original.type" color="neutral" variant="soft" size="sm" />
            </template>

            <template #user-cell="{ row }">
                <div class="text-sm text-gray-900">
                    {{ getUserName(row.original.userId) }}
                </div>
            </template>

            <template #job-cell="{ row }">
                <div class="text-sm text-gray-900">
                    {{ getJobName(row.original.jobId) }}
                </div>
            </template>

            <template #establishment-cell="{ row }">
                <div class="text-sm text-gray-500">
                    {{ row.original.establishment || '—' }}
                </div>
            </template>

            <template #startDate-cell="{ row }">
                <div class="text-sm text-gray-900">
                    {{ useFormatDate(row.original.startDate) }}
                </div>
            </template>

            <template #endDate-cell="{ row }">
                <div class="text-sm text-gray-900">
                    {{ useFormatDate(row.original.endDate) }}
                </div>
            </template>

        </UTable>

        <div v-if="habilitations.length === 0 && !loading && !error" class="text-center py-12">
            <UIcon name="i-heroicons-document-check" class="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 class="text-lg font-medium text-gray-900 mb-2">
                Aucune habilitation
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
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import type { Habilitation } from '~/types/habilitation'
import type { User } from '~/types/auth'
import type { Job } from '~/types/jobs'
import { useFormatDate } from '~/composables/useFormatter'

export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

const props = withDefaults(defineProps<{
    habilitations: Habilitation[]
    users: User[]
    jobs: Job[]
    loading?: boolean
    error?: string | null
    title?: string
    paginationMeta?: PaginationMeta | null
    currentPage?: number
}>(), {
    loading: false,
    error: null,
    title: 'Liste des Habilitations',
    paginationMeta: null,
    currentPage: 1,
})

const emit = defineEmits<{
    (e: 'page-change', page: number): void
}>()

const sorting = ref([])

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

const columns = computed<TableColumn<Habilitation>[]>(() => {
    return [
        {
            accessorKey: 'code',
            header: 'Code',
            enableSorting: true,
            meta: { class: { th: 'text-left' } },
        },
        {
            id: 'status',
            header: 'Statut',
            accessorFn: (row) => {
                const endDate = new Date(row.endDate)
                const today = new Date()
                return endDate < today ? 'expired' : 'active'
            },
            enableSorting: true,
            meta: { class: { th: 'text-left w-[120px]', td: 'w-[120px]' } },
        },
        {
            accessorKey: 'label',
            header: 'Label',
            enableSorting: true,
            meta: { class: { th: 'text-left w-[200px]', td: 'w-[200px]' } },
        },
        {
            accessorKey: 'type',
            header: 'Type',
            enableSorting: true,
            meta: { class: { th: 'text-left' } },
        },
        {
            id: 'user',
            header: 'Employé',
            accessorFn: (row) => getUserName(row.userId),
            enableSorting: true,
            meta: { class: { th: 'text-left' } },
        },
        {
            id: 'job',
            header: 'Emploi',
            accessorFn: (row) => getJobName(row.jobId),
            enableSorting: true,
            meta: { class: { th: 'text-left' } },
        },
        {
            accessorKey: 'establishment',
            header: 'Établissement',
            enableSorting: true,
            meta: { class: { th: 'text-left' } },
        },
        {
            accessorKey: 'startDate',
            header: 'Date de début',
            enableSorting: true,
            meta: { class: { th: 'text-left' } },
        },
        {
            accessorKey: 'endDate',
            header: 'Date de fin',
            enableSorting: true,
            meta: { class: { th: 'text-left' } },
        },
    ]
})

function getUserName(userId: string): string {
    const user = props.users.find(u => u._id === userId)
    return user ? `${user.firstName} ${user.lastName}` : '—'
}

function getJobName(jobId: string): string {
    const job = props.jobs.find(j => j._id === jobId)
    return job ? job.name : '—'
}

function isExpired(endDate: string | Date): boolean {
    if (!endDate) return false

    const end = new Date(endDate)
    end.setHours(0, 0, 0, 0)

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return end < today
}

function onSelect() {
}

</script>
