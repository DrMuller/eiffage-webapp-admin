<template>
    <UCard variant="outline">
        <template #header>
            <span class="text-lg font-semibold mb-4">Macro Skills Management</span>
        </template>

        <!-- Loading State -->
        <div v-if="loading" class="flex justify-center items-center py-12">
            <UIcon name="i-heroicons-arrow-path" class="animate-spin w-6 h-6" />
            <span class="ml-2">Loading macro skills...</span>
        </div>

        <!-- Error State -->
        <UAlert v-else-if="error" icon="i-heroicons-exclamation-triangle" color="red" variant="soft"
            :title="'Error loading macro skills'" :description="error" class="mb-6" />

        <!-- Macro Skills Table -->
        <UTable v-else :data="localMacroSkills" :columns="columns">
            <!-- Name cell template -->
            <template #name-cell="{ row }">
                <div class="font-medium text-gray-900 dark:text-white whitespace-normal break-words">
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
                <div class="flex justify-end">
                    <UButton icon="i-heroicons-eye" size="sm" color="neutral" variant="ghost" aria-label="View Skills"
                        @click="openSkillsModal(row.original)">
                        View Skills
                    </UButton>
                </div>
            </template>
        </UTable>

        <!-- Empty State -->
        <div v-if="!loading && localMacroSkills.length === 0" class="text-center py-12">
            <UIcon name="i-heroicons-folder-open" class="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No macro skills found
            </h3>
            <p class="text-gray-600 dark:text-gray-400">
                Get started by creating your first macro skill.
            </p>
        </div>

        <template #footer>
            <div class="flex justify-between items-center">
                <UButton variant="ghost" icon="i-heroicons-plus" class="text-sm" @click="$emit('add-macro-skill')">
                    Add New Macro Skill
                </UButton>
                <UButton variant="ghost" icon="i-heroicons-arrow-path" class="text-sm" :loading="loading"
                    @click="$emit('refresh')">
                    Refresh
                </UButton>
            </div>
        </template>
    </UCard>

    <!-- Skills Modal -->
    <UModal v-model:open="isModalOpen" :title="modalTitle" :ui="{ content: 'min-w-300' }">
        <template #body>
            <div class="p-6">
                <!-- Macro Skill Type Info -->
                <div class="mb-6">
                    <p class="text-sm text-gray-600 dark:text-gray-400">
                        Type: {{ selectedMacroSkill?.macroSkillType?.name }}
                    </p>
                </div>

                <!-- Modal Loading State -->
                <div v-if="loadingSkills" class="flex justify-center items-center py-8">
                    <UIcon name="i-heroicons-arrow-path" class="animate-spin w-5 h-5" />
                    <span class="ml-2">Loading skills...</span>
                </div>

                <!-- Skills Table -->
                <div v-else-if="relatedSkills.length > 0">
                    <UTable :data="relatedSkills" :columns="skillsColumns">
                        <!-- Skill Name cell template -->
                        <template #name-cell="{ row }">
                            <div class="font-medium text-gray-900 dark:text-white whitespace-normal break-words">
                                {{ row.original.name }}
                            </div>
                        </template>

                        <!-- Expected Level cell template -->
                        <template #expectedLevel-cell="{ row }">
                            <UBadge v-if="row.original.expectedLevel" :label="row.original.expectedLevel"
                                variant="soft" />
                            <span v-else class="text-gray-400">-</span>
                        </template>

                        <!-- Created At cell template -->
                        <template #createdAt-cell="{ row }">
                            <span class="text-gray-500 dark:text-gray-400">
                                {{ formatDate(row.original.createdAt) }}
                            </span>
                        </template>
                    </UTable>
                </div>

                <!-- No Skills State -->
                <div v-else class="text-center py-8">
                    <UIcon name="i-heroicons-document-text" class="w-10 h-10 text-gray-400 mx-auto mb-3" />
                    <h4 class="text-md font-medium text-gray-900 dark:text-white mb-2">
                        No skills found
                    </h4>
                    <p class="text-gray-600 dark:text-gray-400 text-sm">
                        This macro skill doesn't have any associated skills yet.
                    </p>
                </div>
            </div>
        </template>
    </UModal>
</template>

<script setup lang="ts">
import { computed, h } from 'vue'
import type { MacroSkill, Skill } from '~/types/skills'
import type { TableColumn } from '@nuxt/ui'

// Define component props
const props = defineProps<{
    macroSkills: MacroSkill[]
    loading?: boolean
    error?: string | null
}>()

// Define emits
const emit = defineEmits<{
    'select-macro-skill': [macroSkill: MacroSkill]
    'add-macro-skill': []
    'refresh': []
}>()

// Composables
const { skills, getSkills } = useSkills()

// Create local reactive copy of props
const localMacroSkills = computed(() => props.macroSkills)

// Computed modal title
const modalTitle = computed(() => {
    return selectedMacroSkill.value ? `Skills for "${selectedMacroSkill.value.name}"` : 'Skills'
})

// State
const isModalOpen = ref(false)
const selectedMacroSkill = ref<MacroSkill | null>(null)
const loadingSkills = ref(false)
const relatedSkills = ref<Skill[]>([])

// Define table columns
const columns: TableColumn<MacroSkill>[] = [
    {
        accessorKey: 'name',
        meta: {
            class: {
                td: 'w-[500px] max-w-[500px]',
                th: 'w-[500px] max-w-[500px]'
            }
        },
        header: () => {
            return h('div', { class: 'flex items-center' }, [
                'Name'
            ])
        }
    },
    {
        accessorKey: 'macroSkillType',
        meta: {
            class: {
                td: 'w-[200px]',
                th: 'w-[200px]'
            }
        },
        header: () => {
            return h('div', { class: 'flex items-center' }, [
                'Type'
            ])
        }
    },
    {
        accessorKey: 'createdAt',
        header: () => {
            return h('div', { class: 'flex items-center' }, [
                'Created At'
            ])
        }
    },
    {
        id: 'actions',
        header: '',
        meta: {
            class: {
                td: 'w-[120px]',
                th: 'w-[120px]'
            }
        }
    }
]

// Skills table columns
const skillsColumns: TableColumn<Skill>[] = [
    {
        accessorKey: 'name',
        meta: {
            class: {
                td: 'w-[500px] max-w-[500px]',
                th: 'w-[500px] max-w-[500px]'
            }
        },
        header: () => {
            return h('div', { class: 'flex items-center' }, [
                'Skill Name'
            ])
        }
    },
    {
        accessorKey: 'expectedLevel',
        header: () => {
            return h('div', { class: 'flex items-center' }, [
                'Expected Level'
            ])
        }
    },
    {
        accessorKey: 'createdAt',
        header: () => {
            return h('div', { class: 'flex items-center' }, [
                'Created At'
            ])
        }
    }
]

// Methods
const formatDate = (date: Date | string) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    })
}

const openSkillsModal = async (macroSkill: MacroSkill) => {
    selectedMacroSkill.value = macroSkill
    isModalOpen.value = true
    emit('select-macro-skill', macroSkill)

    // Load skills if not already loaded
    if (skills.value.length === 0) {
        loadingSkills.value = true
        try {
            await getSkills()
        } catch (err) {
            console.error('Failed to load skills:', err)
        } finally {
            loadingSkills.value = false
        }
    }

    // Filter skills for this macro skill
    relatedSkills.value = skills.value.filter(
        skill => skill.macroSkillId === macroSkill._id
    )
}

const closeModal = () => {
    isModalOpen.value = false
    selectedMacroSkill.value = null
    relatedSkills.value = []
}
</script>
