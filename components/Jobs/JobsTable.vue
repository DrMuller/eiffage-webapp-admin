<template>
  <UCard variant="outline">
    <template #header>
      <div class="flex items-center gap-3">
        <span class="text-lg font-semibold">{{ title }}</span>
        <UBadge color="info" variant="soft">{{ jobs.length }}</UBadge>
      </div>
    </template>

    <UTable v-model:sorting="sorting" :data="jobs" :columns="columns" @select="onSelect">
      <!-- Sortable headers -->
      <template #name-header="{ column }">
        <div class="inline-flex items-center gap-1 cursor-pointer select-none" @click="column.toggleSorting()">
          <span>Nom</span>
          <UIcon
            :name="column.getIsSorted() === 'asc' ? 'i-heroicons-chevron-up' : column.getIsSorted() === 'desc' ? 'i-heroicons-chevron-down' : 'i-heroicons-chevron-up-down'"
            class="w-4 h-4 text-gray-400" />
        </div>
      </template>
      <template #jobFamily-header="{ column }">
        <div class="inline-flex items-center gap-1 cursor-pointer select-none" @click="column.toggleSorting()">
          <span>Famille</span>
          <UIcon
            :name="column.getIsSorted() === 'asc' ? 'i-heroicons-chevron-up' : column.getIsSorted() === 'desc' ? 'i-heroicons-chevron-down' : 'i-heroicons-chevron-up-down'"
            class="w-4 h-4 text-gray-400" />
        </div>
      </template>
      <template #code-header="{ column }">
        <div class="inline-flex items-center gap-1 cursor-pointer select-none" @click="column.toggleSorting()">
          <span>Code</span>
          <UIcon
            :name="column.getIsSorted() === 'asc' ? 'i-heroicons-chevron-up' : column.getIsSorted() === 'desc' ? 'i-heroicons-chevron-down' : 'i-heroicons-chevron-up-down'"
            class="w-4 h-4 text-gray-400" />
        </div>
      </template>
      <template #jobProfile-header="{ column }">
        <div class="inline-flex items-center gap-1 cursor-pointer select-none" @click="column.toggleSorting()">
          <span>Profil</span>
          <UIcon
            :name="column.getIsSorted() === 'asc' ? 'i-heroicons-chevron-up' : column.getIsSorted() === 'desc' ? 'i-heroicons-chevron-down' : 'i-heroicons-chevron-up-down'"
            class="w-4 h-4 text-gray-400" />
        </div>
      </template>

      <!-- Name cell -->
      <template #name-cell="{ row }">
        <div class="font-medium text-gray-900">
          {{ row.original.name }}
        </div>
      </template>


      <!-- Job Family cell -->
      <template #jobFamily-cell="{ row }">
        <div class="flex flex-wrap gap-1">
          <UBadge v-if="row.original.jobFamily" :label="row.original.jobFamily" variant="soft" color="info" size="sm" />
          <span v-else class="text-gray-400">—</span>
        </div>
      </template>

      <!-- Code cell -->
      <template #code-cell="{ row }">
        <div class="text-sm text-gray-500">
          {{ row.original.code }}
        </div>
      </template>

      <!-- Job Profile cell -->
      <template #jobProfile-cell="{ row }">
        <div class="text-gray-900">
          {{ row.original.jobProfile }}
        </div>
      </template>

      <!-- Details cell -->
      <template #details-cell="{ row }">
        <div class="flex justify-end">
          <UButton icon="fluent:eye-16-regular" size="sm" color="neutral" variant="ghost" aria-label="Voir l'Emploi"
            @click="router.push(`/emplois/${row.original._id}`)">
            Détails
          </UButton>
        </div>
      </template>
    </UTable>

    <div v-if="jobs.length === 0 && !loading && !error" class="text-center py-12">
      <UIcon name="i-heroicons-briefcase" class="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <h3 class="text-lg font-medium text-gray-900 mb-2">
        Aucun emploi trouvé
      </h3>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { TableColumn, TableRow } from '@nuxt/ui'
import type { Job } from '~/types/jobs'

const router = useRouter()

const props = withDefaults(defineProps<{
  jobs: Job[]
  loading?: boolean
  error?: string | null
  title?: string
}>(), {
  loading: false,
  error: null,
  title: 'Liste des Emplois',
})

const sorting = ref([])

const columns = computed<TableColumn<Job>[]>(() => {
  const cols: TableColumn<Job>[] = [
    {
      id: 'name',
      header: 'Nom',
      accessorKey: 'name',
      enableSorting: true,
      meta: { class: { th: 'text-left' } },
    },
    {
      accessorKey: 'code',
      header: 'Code',
      enableSorting: true,
      meta: { class: { th: 'text-left' } },
    },
    {
      accessorKey: 'jobFamily',
      header: 'Famille',
      enableSorting: true,
      meta: { class: { th: 'text-left' } },
    },
    {
      accessorKey: 'jobProfile',
      header: 'Profil',
      enableSorting: true,
      meta: { class: { th: 'text-left' } },
    },
    {
      accessorKey: 'details',
      header: '',
      enableSorting: false,
      meta: { class: { th: 'text-center w-[120px]', td: 'w-[120px]' } },
    },
  ]

  return cols
})

function onSelect(row: TableRow<Job>) {
  router.push(`/emplois/${row.original._id}`)
}
</script>
