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

    <UTable v-model:sorting="sorting" :data="users" :columns="columns">
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
      <template #establishmentName-header="{ column }">
        <div class="inline-flex items-center gap-1 cursor-pointer select-none" @click="column.toggleSorting()">
          <span>Etablissement</span>
          <UIcon
            :name="column.getIsSorted() === 'asc' ? 'i-heroicons-chevron-up' : column.getIsSorted() === 'desc' ? 'i-heroicons-chevron-down' : 'i-heroicons-chevron-up-down'"
            class="w-4 h-4 text-gray-400" />
        </div>
      </template>
      <template #age-header="{ column }">
        <div class="inline-flex items-center gap-1 cursor-pointer select-none" @click="column.toggleSorting()">
          <span>Âge</span>
          <UIcon
            :name="column.getIsSorted() === 'asc' ? 'i-heroicons-chevron-up' : column.getIsSorted() === 'desc' ? 'i-heroicons-chevron-down' : 'i-heroicons-chevron-up-down'"
            class="w-4 h-4 text-gray-400" />
        </div>
      </template>
      <template #gender-header="{ column }">
        <div class="inline-flex items-center gap-1 cursor-pointer select-none" @click="column.toggleSorting()">
          <span>Sexe</span>
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

      <template #establishmentName-cell="{ row }">
        <div class="text-gray-900 dark:text-white max-w-[300px] truncate">
          {{ row.original.establishmentName || '—' }}
        </div>
      </template>

      <template #age-cell="{ row }">
        <div class="text-gray-900 dark:text-white">
          {{ typeof row.original.age === 'number' ? Math.round(row.original.age) : '—' }}
        </div>
      </template>

      <template #gender-cell="{ row }">
        <div class="text-gray-900 dark:text-white">
          {{ row.original.gender === 'FEMALE' ? 'F' : row.original.gender === 'MALE' ? 'H' : '—' }}
        </div>
      </template>

      <template #job-cell="{ row }">
        <div class="text-gray-900 dark:text-white">
          {{row.original.jobId ? jobs.find((j) => j._id === row.original.jobId)?.name : '—'}}
        </div>
      </template>

      <template #details-cell="{ row }">
        <div class="flex justify-end">
          <UButton icon="fluent:eye-16-regular" size="sm" color="neutral" variant="ghost" aria-label="Voir"
            @click.stop="router.push(`/employes/${row.original._id}`)">
            Détails
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
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { TableColumn } from '@nuxt/ui'
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
  paginationMeta?: PaginationMeta | null
  currentPage?: number
}>(), {
  loading: false,
  error: null,
  title: 'Liste des Employés',
  paginationMeta: null,
  currentPage: 1,
})

const emit = defineEmits<{
  (e: 'page-change', page: number): void
}>()

const sorting = ref([])
const currentPageModel = ref(props.currentPage)

watch(() => props.currentPage, (newPage) => {
  currentPageModel.value = newPage
})

watch(currentPageModel, (newPage) => {
  if (newPage !== props.currentPage) {
    emit('page-change', newPage)
  }
})

const columns = computed<TableColumn<User>[]>(() => ([
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
    id: 'establishmentName',
    header: 'Etablissement',
    accessorFn: (row) => row.establishmentName ?? '',
    enableSorting: true,
    meta: { class: { th: 'text-left', td: 'max-w-[300px]' } },
  },
  {
    id: 'age',
    header: 'Âge',
    accessorFn: (row) => typeof row.age === 'number' ? row.age : -1,
    enableSorting: true,
    meta: { class: { th: 'text-left w-[90px]', td: 'w-[90px]' } },
  },
  {
    id: 'gender',
    header: 'Sexe',
    accessorFn: (row) => row.gender === 'FEMALE' ? 'F' : row.gender === 'MALE' ? 'H' : '',
    enableSorting: true,
    meta: { class: { th: 'text-left w-[90px]', td: 'w-[90px]' } },
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
]))
</script>
