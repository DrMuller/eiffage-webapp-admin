<template>
    <UCard variant="outline">
        <template #header>
            <div class="flex justify-between items-center gap-3">
                <span class="text-lg font-semibold">{{ title }}</span>
                <UButton icon="i-heroicons-arrow-path" size="sm" color="neutral" variant="ghost" :loading="loading"
                    @click="$emit('refresh')">
                    Actualiser
                </UButton>
            </div>
        </template>

        <!-- Loading State -->
        <div v-if="loading" class="flex justify-center items-center py-12">
            <UIcon name="i-heroicons-arrow-path" class="animate-spin w-6 h-6" />
            <span class="ml-2">Chargement des Compétences...</span>
        </div>

        <!-- Error State -->
        <UAlert v-else-if="error" icon="i-heroicons-exclamation-triangle" color="error" variant="soft"
            title="Erreur lors du chargement des Compétences" :description="error" class="mb-6" />

        <!-- Skills Table -->
        <UTable v-else :data="skills" :columns="columns" class="h-full" sticky>
            <!-- Name -->
            <template #name-cell="{ row }">
                <div>
                    {{ row.original.name }}
                </div>
            </template>
            <!-- Macro Skill -->
            <template #macroSkill-cell="{ row }">
                <div>
                    {{ row.original.macroSkill?.name }}
                </div>
            </template>

        </UTable>

        <!-- Empty State -->
        <div v-if="skills.length === 0 && !loading && !error" class="text-center py-12">
            <UIcon name="i-heroicons-academic-cap" class="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Aucune Compétence trouvée
            </h3>
            <p class="text-gray-600 dark:text-gray-400">
                Essayez d’ajuster votre recherche ou vos filtres.
            </p>
        </div>
    </UCard>
</template>

<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { Skill } from '~/types/skills'

const props = withDefaults(defineProps<{
    skills: Skill[]
    loading?: boolean
    error?: string | null
    title?: string
}>(), {
    loading: false,
    error: null,
    title: 'Liste des Compétences'
})

const columns: TableColumn<Skill>[] = [
    {
        accessorKey: 'name',
        header: 'Nom',
        meta: { class: { th: 'text-left', td: 'w-[700px] whitespace-normal break-words align-top' } }
    },
    {
        accessorKey: 'macroSkill',
        header: 'Macro compétence',
        meta: { class: { th: 'text-left', td: 'w-[500px] whitespace-normal break-words align-top' } }
    },
]
</script>
