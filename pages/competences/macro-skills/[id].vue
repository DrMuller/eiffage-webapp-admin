<template>
    <div class="p-6">
        <!-- Breadcrumb -->
        <div class="mb-6">
            <UButton variant="ghost" icon="i-heroicons-arrow-left" size="sm" @click="router.back()">
                Retour
            </UButton>
        </div>

        <!-- Loading State -->
        <div v-if="loadingMacroSkill" class="flex justify-center items-center py-12">
            <UIcon name="i-heroicons-arrow-path" class="animate-spin w-6 h-6" />
            <span class="ml-2">Chargement de la macro compétence...</span>
        </div>

        <!-- Error State -->
        <UAlert v-else-if="error" icon="i-heroicons-exclamation-triangle" color="error" variant="soft"
            title="Erreur lors du chargement" :description="error" class="mb-6" />

        <!-- Macro Skill Details -->
        <div v-else-if="macroSkill" class="space-y-6">
            <!-- Header -->
            <div class="mb-6">
                <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
                    {{ macroSkill.name }}
                </h1>
                <div class="flex items-center gap-2 mt-2">
                    <UBadge :label="macroSkill.macroSkillType?.name || 'Unknown'" variant="soft" color="info" />
                    <span class="text-gray-500 text-sm">
                        Créé le {{ formatDate(macroSkill.createdAt) }}
                    </span>
                </div>
            </div>

            <!-- Micro Skills Section -->
            <UCard variant="outline">
                <template #header>
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <span class="text-lg font-semibold">Compétences (Micro Skills)</span>
                            <UBadge color="info" variant="soft">{{ microSkills.length }}</UBadge>
                        </div>
                        <UButton icon="i-heroicons-plus" size="sm" color="primary" @click="openAddSkillModal">
                            Ajouter une compétence
                        </UButton>
                    </div>
                </template>

                <!-- Loading State for Skills -->
                <div v-if="loadingSkills" class="flex justify-center items-center py-8">
                    <UIcon name="i-heroicons-arrow-path" class="animate-spin w-5 h-5" />
                    <span class="ml-2">Chargement des compétences...</span>
                </div>

                <!-- Skills Table -->
                <UTable v-else-if="microSkills.length > 0" v-model:sorting="sorting" :data="microSkills"
                    :columns="skillColumns">
                    <!-- Skill Name cell -->
                    <template #name-cell="{ row }">
                        <div class="font-medium text-gray-900 dark:text-white">
                            {{ row.original.name }}
                        </div>
                    </template>

                    <!-- Expected Level cell -->
                    <template #expectedLevel-cell="{ row }">
                        <UBadge v-if="row.original.expectedLevel" :label="String(row.original.expectedLevel)"
                            variant="soft" color="primary" />
                        <span v-else class="text-gray-400">-</span>
                    </template>

                    <!-- Jobs count cell -->
                    <template #jobIds-cell="{ row }">
                        <UBadge :label="String(row.original.jobIds?.length || 0)" variant="soft" color="neutral" />
                    </template>

                    <!-- Created At cell -->
                    <template #createdAt-cell="{ row }">
                        <span class="text-gray-500 dark:text-gray-400">
                            {{ formatDate(row.original.createdAt) }}
                        </span>
                    </template>

                    <!-- Actions cell -->
                    <template #actions-cell="{ row }">
                        <div class="flex justify-end gap-2">
                            <UButton icon="i-heroicons-trash" size="sm" color="error" variant="ghost"
                                aria-label="Delete Skill" @click="openDeleteConfirmModal(row.original)">
                                Supprimer
                            </UButton>
                        </div>
                    </template>
                </UTable>

                <!-- Empty State -->
                <div v-else class="text-center py-12">
                    <UIcon name="i-heroicons-document-text" class="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        Aucune compétence trouvée
                    </h3>
                    <p class="text-gray-600 dark:text-gray-400 mb-4">
                        Cette macro compétence n'a pas encore de compétences associées.
                    </p>
                    <UButton icon="i-heroicons-plus" size="sm" @click="openAddSkillModal">
                        Ajouter la première compétence
                    </UButton>
                </div>

                <template #footer>
                    <div class="flex justify-end">
                        <UButton variant="ghost" icon="i-heroicons-arrow-path" class="text-sm" :loading="loadingSkills"
                            @click="loadSkills">
                            Actualiser
                        </UButton>
                    </div>
                </template>
            </UCard>
        </div>

        <!-- Add Skill Modal -->
        <UModal v-model:open="isAddSkillModalOpen" title="Ajouter une compétence">
            <template #body>
                <div class="p-6 space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Nom de la compétence *
                        </label>
                        <UInput v-model="newSkillForm.name" placeholder="Ex: JavaScript, Python, Communication..."
                            :error="formErrors.name" />
                        <p v-if="formErrors.name" class="text-sm text-red-600 mt-1">{{ formErrors.name }}</p>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Niveau attendu (optionnel)
                        </label>
                        <UInput v-model.number="newSkillForm.expectedLevel" type="number" min="1" max="5"
                            placeholder="1-5" />
                        <p class="text-sm text-gray-500 mt-1">Niveau de 1 à 5 (optionnel)</p>
                    </div>
                </div>
            </template>

            <template #footer>
                <div class="flex justify-end gap-2">
                    <UButton variant="ghost" @click="closeAddSkillModal">
                        Annuler
                    </UButton>
                    <UButton color="primary" :loading="submittingSkill" :disabled="!newSkillForm.name"
                        @click="handleAddSkill">
                        Ajouter
                    </UButton>
                </div>
            </template>
        </UModal>

        <!-- Delete Confirmation Modal -->
        <UModal v-model:open="isDeleteModalOpen" title="Confirmer la suppression">
            <template #body>
                <div class="p-6">
                    <div class="flex items-start gap-3 mb-4">
                        <div class="flex-shrink-0">
                            <UIcon name="i-heroicons-exclamation-triangle" class="w-6 h-6 text-red-600" />
                        </div>
                        <div>
                            <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                Supprimer la compétence
                            </h3>
                            <p class="text-gray-600 dark:text-gray-400">
                                Êtes-vous sûr de vouloir supprimer la compétence
                                <strong>{{ skillToDelete?.name }}</strong> ?
                            </p>
                            <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                Cette action est irréversible.
                            </p>
                        </div>
                    </div>
                </div>
            </template>

            <template #footer>
                <div class="flex justify-end gap-2">
                    <UButton variant="ghost" @click="closeDeleteModal">
                        Annuler
                    </UButton>
                    <UButton color="error" :loading="deletingSkill" @click="handleDeleteSkill">
                        Supprimer
                    </UButton>
                </div>
            </template>
        </UModal>
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { MacroSkill, Skill, CreateSkillRequest } from '~/types/skills'
import type { TableColumn, SortingState } from '@nuxt/ui'

// Meta
definePageMeta({
    middleware: 'auth',
    layout: 'default'
})

// Composables
const route = useRoute()
const router = useRouter()
const toast = useToast()
const {
    skills,
    loading,
    error,
    getMacroSkillById,
    getSkills,
    createSkill,
    deleteSkill
} = useSkills()

// Local state
const macroSkill = ref<MacroSkill | null>(null)
const loadingMacroSkill = ref(false)
const loadingSkills = ref(false)
const sorting = ref<SortingState>([])

// Modal states
const isAddSkillModalOpen = ref(false)
const isDeleteModalOpen = ref(false)
const skillToDelete = ref<Skill | null>(null)
const submittingSkill = ref(false)
const deletingSkill = ref(false)

// Form state
const newSkillForm = ref<CreateSkillRequest>({
    name: '',
    macroSkillId: '',
    expectedLevel: null
})

const formErrors = ref<{ name?: string }>({})

// Computed properties
const macroSkillId = computed(() => route.params.id as string)

const microSkills = computed<Skill[]>(() => {
    if (!macroSkill.value) return []
    return skills.value.filter(skill => skill.macroSkillId === macroSkill.value!._id)
})

// Define skill columns
const skillColumns = computed<TableColumn<Skill>[]>(() => [
    {
        accessorKey: 'name',
        header: 'Nom',
        enableSorting: true,
        meta: {
            class: {
                td: 'w-[400px] max-w-[400px]',
                th: 'w-[400px] max-w-[400px]'
            }
        }
    },
    {
        accessorKey: 'expectedLevel',
        header: 'Niveau attendu',
        enableSorting: true,
        meta: {
            class: {
                td: 'w-[150px]',
                th: 'w-[150px]'
            }
        }
    },
    {
        accessorKey: 'jobIds',
        header: 'Emplois liés',
        enableSorting: false,
        meta: {
            class: {
                td: 'w-[120px]',
                th: 'w-[120px]'
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

const loadMacroSkill = async () => {
    loadingMacroSkill.value = true
    try {
        macroSkill.value = await getMacroSkillById(macroSkillId.value)
    } catch (err) {
        console.error('Failed to load macro skill:', err)
        toast.add({
            title: 'Erreur',
            description: 'Impossible de charger la macro compétence',
            color: 'error',
            timeout: 3000
        })
    } finally {
        loadingMacroSkill.value = false
    }
}

const loadSkills = async () => {
    loadingSkills.value = true
    try {
        await getSkills()
    } catch (err) {
        console.error('Failed to load skills:', err)
        toast.add({
            title: 'Erreur',
            description: 'Impossible de charger les compétences',
            color: 'error',
            timeout: 3000
        })
    } finally {
        loadingSkills.value = false
    }
}

// Add skill modal methods
const openAddSkillModal = () => {
    newSkillForm.value = {
        name: '',
        macroSkillId: macroSkillId.value,
        expectedLevel: null
    }
    formErrors.value = {}
    isAddSkillModalOpen.value = true
}

const closeAddSkillModal = () => {
    isAddSkillModalOpen.value = false
    newSkillForm.value = {
        name: '',
        macroSkillId: '',
        expectedLevel: null
    }
    formErrors.value = {}
}

const validateSkillForm = (): boolean => {
    formErrors.value = {}

    if (!newSkillForm.value.name?.trim()) {
        formErrors.value.name = 'Le nom est requis'
        return false
    }

    return true
}

const handleAddSkill = async () => {
    if (!validateSkillForm()) return

    submittingSkill.value = true
    try {
        await createSkill({
            name: newSkillForm.value.name,
            macroSkillId: macroSkillId.value,
            expectedLevel: newSkillForm.value.expectedLevel || null
        })

        toast.add({
            title: 'Succès',
            description: 'Compétence ajoutée avec succès',
            color: 'success',
            timeout: 3000
        })

        closeAddSkillModal()
        await loadSkills()
    } catch (err) {
        console.error('Failed to create skill:', err)
        toast.add({
            title: 'Erreur',
            description: 'Impossible de créer la compétence',
            color: 'error',
            timeout: 3000
        })
    } finally {
        submittingSkill.value = false
    }
}

// Delete skill modal methods
const openDeleteConfirmModal = (skill: Skill) => {
    skillToDelete.value = skill
    isDeleteModalOpen.value = true
}

const closeDeleteModal = () => {
    isDeleteModalOpen.value = false
    skillToDelete.value = null
}

const handleDeleteSkill = async () => {
    if (!skillToDelete.value) return

    deletingSkill.value = true
    try {
        await deleteSkill(skillToDelete.value._id)

        toast.add({
            title: 'Succès',
            description: 'Compétence supprimée avec succès',
            color: 'success',
            timeout: 3000
        })

        closeDeleteModal()
        await loadSkills()
    } catch (err) {
        console.error('Failed to delete skill:', err)
        toast.add({
            title: 'Erreur',
            description: 'Impossible de supprimer la compétence',
            color: 'error',
            timeout: 3000
        })
    } finally {
        deletingSkill.value = false
    }
}

// Lifecycle
onMounted(async () => {
    try {
        await Promise.all([
            loadMacroSkill(),
            loadSkills()
        ])
    } catch (err) {
        console.error('Failed to load data:', err)
    }
})

// Head
useHead({
    title: computed(() => macroSkill.value ? `${macroSkill.value.name} - Macro Compétence` : 'Macro Compétence')
})
</script>
