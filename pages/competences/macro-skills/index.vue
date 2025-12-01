<template>
    <div class="p-6">
        <div class="mb-6">
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
                Gestion des Macro Compétences
            </h1>
            <p class="text-gray-600 dark:text-gray-400 mt-2">
                Gérer et visualiser toutes les Macro Compétences du système
            </p>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="flex justify-center items-center py-12">
            <UIcon name="i-heroicons-arrow-path" class="animate-spin w-6 h-6" />
            <span class="ml-2">Chargement des Macro Compétences...</span>
        </div>

        <!-- Error State -->
        <UAlert v-else-if="error" icon="i-heroicons-exclamation-triangle" color="error" variant="soft"
            title="Erreur lors du chargement des Macro Compétences" :description="error" class="mb-6" />

        <!-- Search and Filters -->
        <div v-else class="mb-3">
            <div class="flex flex-wrap items-center gap-2 mb-3">
                <UInput v-model="searchQuery" placeholder="Rechercher une macro compétence par nom (live)"
                    class="w-[420px]" />
            </div>
            <div class="flex flex-wrap items-center gap-2">
                <USelectMenu v-model="selectedTypeIds" :items="typeOptions" :value-key="'value'" multiple searchable
                    searchable-placeholder="Filtrer par type..." class="w-[420px]" placeholder="Types de compétences" />
                <UButton icon="i-heroicons-x-mark" size="sm" color="secondary" variant="ghost" :loading="loading"
                    @click="handleReset">
                    Réinitialiser
                </UButton>
            </div>
        </div>

        <!-- Macro Skills Table -->
        <UCard variant="outline">
            <template #header>
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <span class="text-lg font-semibold">Liste des Macro Compétences</span>
                        <UBadge color="info" variant="soft">{{ filteredMacroSkills.length }}</UBadge>
                    </div>
                </div>
            </template>

            <UTable v-model:sorting="sorting" :data="filteredMacroSkills" :columns="columns">
                <!-- Name cell with click handler -->
                <template #name-cell="{ row }">
                    <div class="font-medium text-primary-600 dark:text-primary-400 cursor-pointer hover:underline"
                        @click="navigateToDetail(row.original._id)">
                        {{ row.original.name }}
                    </div>
                </template>

                <!-- Type cell template -->
                <template #macroSkillType-cell="{ row }">
                    <UBadge :label="row.original.macroSkillType?.name || 'Unknown'" variant="soft" color="info" />
                </template>

                <!-- Created At cell template -->
                <template #createdAt-cell="{ row }">
                    <span class="text-gray-500 dark:text-gray-400">
                        {{ formatDate(row.original.createdAt) }}
                    </span>
                </template>

                <!-- Actions cell template -->
                <template #actions-cell="{ row }">
                    <div class="flex justify-end gap-2">
                        <UButton icon="i-heroicons-pencil" size="sm" color="neutral" variant="ghost"
                            aria-label="Edit Macro Skill" @click="navigateToDetail(row.original._id)">
                            Modifier
                        </UButton>
                    </div>
                </template>
            </UTable>

            <!-- Empty State -->
            <div v-if="!loading && filteredMacroSkills.length === 0" class="text-center py-12">
                <UIcon name="i-heroicons-folder-open" class="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Aucune macro compétence trouvée
                </h3>
                <p class="text-gray-600 dark:text-gray-400">
                    {{ searchQuery || selectedTypeIds.length > 0 ? 'Essayez de modifier vos filtres.' : 'Commencez par créer votre première macro compétence.' }}
                </p>
            </div>

            <template #footer>
                <div class="flex justify-end items-center">
                    <UButton variant="ghost" icon="i-heroicons-arrow-path" class="text-sm" :loading="loading"
                        @click="handleRefresh">
                        Actualiser
                    </UButton>
                </div>
            </template>
        </UCard>
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { MacroSkill, MacroSkillType } from '~/types/skills'
import type { TableColumn, SortingState } from '@nuxt/ui'

// Meta
definePageMeta({
    middleware: 'auth',
    layout: 'default'
})

// Composables
const { macroSkills, macroSkillTypes, loading, error, getMacroSkills, getMacroSkillTypes } = useSkills()
const router = useRouter()

// Local state
const searchQuery = ref('')
const selectedTypeIds = ref<string[]>([])
const sorting = ref<SortingState>([])

// Type select options
const typeOptions = computed(() =>
    macroSkillTypes.value.map((type: MacroSkillType) => ({
        label: type.name,
        value: type._id
    }))
)

// Client-side live filtering
const filteredMacroSkills = computed<MacroSkill[]>(() => {
    const q = searchQuery.value.trim().toLowerCase()
    let list = macroSkills.value

    // Filter by search query
    if (q.length > 0) {
        list = list.filter(ms => ms.name.toLowerCase().includes(q))
    }

    // Filter by types
    if (selectedTypeIds.value && selectedTypeIds.value.length > 0) {
        const allowedTypeIds = new Set(selectedTypeIds.value)
        list = list.filter(ms => allowedTypeIds.has(ms.macroSkillTypeId))
    }

    return list
})

// Define table columns
const columns = computed<TableColumn<MacroSkill>[]>(() => [
    {
        accessorKey: 'name',
        header: 'Nom',
        enableSorting: true,
        meta: {
            class: {
                td: 'w-[500px] max-w-[500px]',
                th: 'w-[500px] max-w-[500px]'
            }
        }
    },
    {
        accessorKey: 'macroSkillType',
        header: 'Type',
        enableSorting: false,
        meta: {
            class: {
                td: 'w-[200px]',
                th: 'w-[200px]'
            }
        }
    },
    {
        accessorKey: 'createdAt',
        header: 'Date de création',
        enableSorting: true
    },
    {
        id: 'actions',
        header: '',
        meta: {
            class: {
                td: 'w-[150px]',
                th: 'w-[150px]'
            }
        }
    }
])

// Methods
const formatDate = (date: Date | string) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    })
}

const navigateToDetail = (id: string) => {
    router.push(`/competences/macro-skills/${id}`)
}

// Actions
const handleRefresh = async () => {
    try {
        await Promise.all([
            getMacroSkills(),
            getMacroSkillTypes()
        ])
    } catch (err) {
        console.error('Échec de l\'actualisation des Macro Compétences:', err)
    }
}

const handleReset = () => {
    searchQuery.value = ''
    selectedTypeIds.value = []
}

// Lifecycle
onMounted(async () => {
    try {
        await Promise.all([
            getMacroSkills(),
            getMacroSkillTypes()
        ])
    } catch (err) {
        console.error('Échec du chargement des Macro Compétences:', err)
    }
})

// Head
useHead({
    title: 'Gestion des Macro Compétences - Eiffage'
})
</script>
