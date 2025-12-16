<template>
    <div class="p-6">
        <!-- Breadcrumb -->
        <div class="mb-6">
            <UButton variant="ghost" icon="i-heroicons-arrow-left" size="sm" @click="router.back()">
                Retour
            </UButton>
        </div>

        <!-- Loading State -->
        <div v-if="loadingJob" class="flex justify-center items-center py-12">
            <UIcon name="i-heroicons-arrow-path" class="animate-spin w-6 h-6" />
            <span class="ml-2">Chargement de l'emploi...</span>
        </div>

        <!-- Job Details -->
        <div v-else-if="job" class="space-y-6">
            <!-- Job Information Card -->
            <UCard variant="outline">
                <template #header>
                    <h1 class="text-2xl font-bold text-gray-900">
                        {{ job.name }}
                    </h1>
                </template>

                <div class="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="text-sm font-medium text-gray-500">Code</label>
                        <p class="text-gray-900 mt-1">
                            <UBadge :label="job.code" variant="soft" color="neutral" />
                        </p>
                    </div>

                    <div>
                        <label class="text-sm font-medium text-gray-500">Profil</label>
                        <p class="text-gray-900 mt-1 whitespace-normal break-words">
                            {{ job.jobProfile }}
                        </p>
                    </div>

                    <div v-if="job.jobFamily">
                        <label class="text-sm font-medium text-gray-500">Famille</label>
                        <p class="text-gray-900 mt-1">
                            <UBadge :label="job.jobFamily" variant="soft" color="info" />
                        </p>
                    </div>

                    <div>
                        <label class="text-sm font-medium text-gray-500">Date de création</label>
                        <p class="text-gray-900 mt-1">
                            {{ formatDate(job.createdAt) }}
                        </p>
                    </div>
                </div>
            </UCard>

            <!-- Skills Section - Table -->
            <UCard variant="outline">
                <template #header>
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <span class="text-lg font-semibold">Compétences</span>
                            <UBadge color="info" variant="soft">{{ jobSkills.length }}</UBadge>
                        </div>
                        <div class="flex items-center gap-2">
                            <UButton icon="i-heroicons-plus" size="sm" color="secondary" variant="outline"
                                @click="openAddMacroSkillModal">
                                Ajouter une macro compétence
                            </UButton>
                            <UButton icon="i-heroicons-plus" size="sm" color="primary" @click="openAddSkillModal">
                                Ajouter une compétence
                            </UButton>
                        </div>
                    </div>
                </template>

                <UTable v-model:sorting="sorting" :data="jobSkills" :columns="columns" :loading="loadingSkills">
                    <!-- Sortable headers -->
                    <template #skillName-header="{ column }">
                        <div class="inline-flex items-center gap-1 cursor-pointer select-none"
                            @click="column.toggleSorting()">
                            <span>Compétence</span>
                            <UIcon
                                :name="column.getIsSorted() === 'asc' ? 'i-heroicons-chevron-up' : column.getIsSorted() === 'desc' ? 'i-heroicons-chevron-down' : 'i-heroicons-chevron-up-down'"
                                class="w-4 h-4 text-gray-400" />
                        </div>
                    </template>
                    <template #macroSkillName-header="{ column }">
                        <div class="inline-flex items-center gap-1 cursor-pointer select-none"
                            @click="column.toggleSorting()">
                            <span>Macro Compétence</span>
                            <UIcon
                                :name="column.getIsSorted() === 'asc' ? 'i-heroicons-chevron-up' : column.getIsSorted() === 'desc' ? 'i-heroicons-chevron-down' : 'i-heroicons-chevron-up-down'"
                                class="w-4 h-4 text-gray-400" />
                        </div>
                    </template>
                    <template #macroSkillTypeName-header="{ column }">
                        <div class="inline-flex items-center gap-1 cursor-pointer select-none"
                            @click="column.toggleSorting()">
                            <span>Type</span>
                            <UIcon
                                :name="column.getIsSorted() === 'asc' ? 'i-heroicons-chevron-up' : column.getIsSorted() === 'desc' ? 'i-heroicons-chevron-down' : 'i-heroicons-chevron-up-down'"
                                class="w-4 h-4 text-gray-400" />
                        </div>
                    </template>
                    <template #expectedLevel-header="{ column }">
                        <div class="inline-flex items-center gap-1 cursor-pointer select-none"
                            @click="column.toggleSorting()">
                            <span>Niveau</span>
                            <UIcon
                                :name="column.getIsSorted() === 'asc' ? 'i-heroicons-chevron-up' : column.getIsSorted() === 'desc' ? 'i-heroicons-chevron-down' : 'i-heroicons-chevron-up-down'"
                                class="w-4 h-4 text-gray-400" />
                        </div>
                    </template>

                    <!-- Skill Name cell -->
                    <template #skillName-cell="{ row }">
                        <div class="font-medium text-gray-900 whitespace-normal break-words">
                            {{ row.original.skillName }}
                        </div>
                    </template>

                    <!-- Macro Skill Name cell -->
                    <template #macroSkillName-cell="{ row }">
                        <div class="text-gray-900 whitespace-normal break-words">
                            {{ row.original.macroSkillName }}
                        </div>
                    </template>

                    <!-- Macro Skill Type cell -->
                    <template #macroSkillTypeName-cell="{ row }">
                        <div class="text-sm text-gray-500 whitespace-normal break-words">
                            <UBadge color="secondary" variant="soft">{{ row.original.macroSkillTypeName }}</UBadge>
                        </div>
                    </template>

                    <!-- Expected Level cell -->
                    <template #expectedLevel-cell="{ row }">
                        <div v-if="row.original.expectedLevel" class="flex items-center justify-end gap-2">
                            <USelect v-model="row.original.expectedLevel" :items="levelOptions" :value-key="'value'"
                                :label-key="'label'" size="sm" class="w-32"
                                :loading="updatingSkillId === row.original.skillId"
                                :disabled="updatingSkillId === row.original.skillId"
                                @update:model-value="(newLevel) => handleUpdateSkillLevel(row.original.skillId, newLevel)" />
                        </div>
                        <span v-else class="text-sm text-gray-400">—</span>
                    </template>

                    <!-- Actions cell -->
                    <template #actions-cell="{ row }">
                        <div class="flex justify-end">
                            <UButton icon="i-heroicons-trash" size="sm" color="error" variant="ghost"
                                :loading="deletingSkillId === row.original.skillId"
                                @click="confirmDeleteSkill(row.original.skillId)" />
                        </div>
                    </template>
                </UTable>

                <div v-if="jobSkills.length === 0 && !loadingSkills" class="text-center py-12">
                    <UIcon name="i-heroicons-document-text" class="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 class="text-lg font-medium text-gray-900 mb-2">
                        Aucune compétence associée à cet emploi
                    </h3>
                </div>
            </UCard>
        </div>

        <!-- Add Macro Skill Modal -->
        <UModal v-model:open="isAddMacroSkillModalOpen" :title="'Ajouter une macro compétence'">
            <template #body>
                <div class="p-6 space-y-4">
                    <!-- Macro Skill Family Select -->
                    <UFormField label="Famille de Macro Compétence *">
                        <USelect v-model="macroSkillTypeId" :items="macroSkillTypeOptions" :value-key="'value'"
                            :label-key="'label'" placeholder="Sélectionner une famille" searchable class="w-full" />
                    </UFormField>

                    <!-- Macro Skill Name Input -->
                    <UFormField label="Nom de la Macro Compétence *">
                        <UInput v-model="macroSkillName" placeholder="Entrez le nom de la macro compétence"
                            class="w-full" />
                    </UFormField>

                    <div class="flex gap-2 justify-end mt-6">
                        <UButton color="neutral" variant="outline" @click="closeAddMacroSkillModal">
                            Annuler
                        </UButton>
                        <UButton color="primary" variant="solid" :loading="addingMacroSkill"
                            :disabled="!canSubmitMacroSkillForm" @click="handleAddMacroSkill">
                            Ajouter
                        </UButton>
                    </div>
                </div>
            </template>
        </UModal>

        <!-- Add Skill Modal -->
        <UModal v-model:open="isAddSkillModalOpen" :title="'Ajouter une compétence'">
            <template #body>
                <div class="p-6 space-y-4">
                    <!-- Macro Skill Select -->
                    <UFormField label="Macro Compétence *">
                        <USelect v-model="selectedMacroSkillId" :items="macroSkillOptions" :value-key="'value'"
                            :label-key="'label'" placeholder="Sélectionner une macro compétence" searchable
                            searchable-placeholder="Rechercher une macro compétence..." class="w-full" />
                    </UFormField>

                    <!-- Skill Name Input -->
                    <UFormField label="Nom de la Compétence *">
                        <UInput v-model="newSkillName" placeholder="Entrez le nom de la compétence" class="w-full" />
                    </UFormField>

                    <!-- Skill Level Select -->
                    <UFormField label="Niveau Attendu *">
                        <USelect v-model="newSkillLevel" :items="levelOptions" :value-key="'value'" :label-key="'label'"
                            placeholder="Sélectionner un niveau" class="w-full" />
                    </UFormField>

                    <div class="flex gap-2 justify-end mt-6">
                        <UButton color="neutral" variant="outline" @click="closeAddSkillModal">
                            Annuler
                        </UButton>
                        <UButton color="primary" variant="solid" :loading="addingSkill" :disabled="!canSubmitSkillForm"
                            @click="handleAddSkill">
                            Ajouter
                        </UButton>
                    </div>
                </div>
            </template>
        </UModal>
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import type { Job, JobSkillResponse } from '~/types/jobs'
import type { MacroSkill, MacroSkillType } from '~/types/skills'
import { useSkillLevelLabel } from '~/composables/useSkillLevel'

// Meta
definePageMeta({
    middleware: 'auth',
    layout: 'default'
})

// Composables
const route = useRoute()
const router = useRouter()
const toast = useToast()
const { getJobById, getJobSkills, removeSkillFromJob, addSkillToJob, updateJobSkillLevel } = useJobs()
const { getMacroSkills, getMacroSkillTypes, createMacroSkill, createSkill } = useSkills()

// Local state
const job = ref<Job | null>(null)
const jobSkills = ref<JobSkillResponse[]>([])
const loadingJob = ref(false)
const loadingSkills = ref(false)
const sorting = ref([])

// Delete skill state
const deletingSkillId = ref<string | null>(null)

// Update skill level state
const updatingSkillId = ref<string | null>(null)

// Add macro skill modal state
const isAddMacroSkillModalOpen = ref(false)
const macroSkillTypeId = ref<string>('')
const macroSkillName = ref('')
const addingMacroSkill = ref(false)

// Add skill modal state
const isAddSkillModalOpen = ref(false)
const macroSkills = ref<MacroSkill[]>([])
const macroSkillTypes = ref<MacroSkillType[]>([])
const selectedMacroSkillId = ref<string>('')
const newSkillName = ref('')
const newSkillLevel = ref<number>(3)
const addingSkill = ref(false)

// Computed properties
const jobId = computed(() => route.params.id as string)

// Add macro skill modal computed properties
const canSubmitMacroSkillForm = computed(() => {
    return macroSkillName.value.trim().length > 0 &&
        macroSkillTypeId.value.length > 0
})

// Add skill modal computed properties
const macroSkillOptions = computed(() =>
    macroSkills.value.map(ms => ({
        label: `${ms.name} (${ms.macroSkillType.name})`,
        value: ms._id
    }))
)

const macroSkillTypeOptions = computed(() =>
    macroSkillTypes.value.map(type => ({
        label: type.name,
        value: type._id
    }))
)

const levelOptions = computed(() => [1, 2, 3, 4].map(v => ({
    label: useSkillLevelLabel(v),
    value: v
})))

const canSubmitSkillForm = computed(() => {
    const hasSkillName = newSkillName.value.trim().length > 0
    const hasLevel = newSkillLevel.value >= 1 && newSkillLevel.value <= 4
    const hasMacroSkill = selectedMacroSkillId.value.length > 0

    return hasSkillName && hasLevel && hasMacroSkill
})

// Table columns
const columns = computed<TableColumn<JobSkillResponse>[]>(() => [
    {
        id: 'skillName',
        header: 'Compétence',
        accessorKey: 'skillName',
        enableSorting: true,
        meta: { class: { th: 'text-left' } },
    },
    {
        accessorKey: 'macroSkillName',
        header: 'Macro Compétence',
        enableSorting: true,
        meta: { class: { th: 'text-left' } },
    },
    {
        accessorKey: 'macroSkillTypeName',
        header: 'Type',
        enableSorting: true,
        meta: { class: { th: 'text-left' } },
    },
    {
        accessorKey: 'expectedLevel',
        header: 'Niveau',
        enableSorting: true,
        meta: { class: { th: 'text-right', td: 'text-right' } },
    },
    {
        accessorKey: 'actions',
        header: '',
        enableSorting: false,
        meta: { class: { th: 'w-[80px]', td: 'w-[80px]' } },
    },
])

// Methods
const formatDate = (date: Date | string) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })
}

const openAddMacroSkillModal = async () => {
    try {
        // Load macro skill types if not already loaded
        if (macroSkillTypes.value.length === 0) {
            macroSkillTypes.value = await getMacroSkillTypes()
        }
        isAddMacroSkillModalOpen.value = true
    } catch (err) {
        console.error('Failed to load macro skill types:', err)
        toast.add({
            title: 'Erreur',
            description: 'Impossible de charger les familles de macro compétences',
            color: 'error'
        })
    }
}

const closeAddMacroSkillModal = () => {
    isAddMacroSkillModalOpen.value = false
    macroSkillTypeId.value = ''
    macroSkillName.value = ''
}

const handleAddMacroSkill = async () => {
    if (!canSubmitMacroSkillForm.value) return

    addingMacroSkill.value = true
    try {
        await createMacroSkill({
            name: macroSkillName.value.trim(),
            macroSkillTypeId: macroSkillTypeId.value
        })

        toast.add({
            title: 'Succès',
            description: 'Macro compétence créée avec succès',
            color: 'success'
        })

        // Reload macro skills for the skill modal
        macroSkills.value = await getMacroSkills()

        closeAddMacroSkillModal()
    } catch (err) {
        console.error('Failed to add macro skill:', err)
        toast.add({
            title: 'Erreur',
            description: 'Impossible de créer la macro compétence',
            color: 'error'
        })
    } finally {
        addingMacroSkill.value = false
    }
}

const openAddSkillModal = async () => {
    try {
        // Load macro skills and types if not already loaded
        if (macroSkills.value.length === 0) {
            macroSkills.value = await getMacroSkills()
        }
        if (macroSkillTypes.value.length === 0) {
            macroSkillTypes.value = await getMacroSkillTypes()
        }
        isAddSkillModalOpen.value = true
    } catch (err) {
        console.error('Failed to load data for modal:', err)
        toast.add({
            title: 'Erreur',
            description: 'Impossible de charger les données',
            color: 'error'
        })
    }
}

const closeAddSkillModal = () => {
    isAddSkillModalOpen.value = false
    selectedMacroSkillId.value = ''
    newSkillName.value = ''
    newSkillLevel.value = 3
}

const handleAddSkill = async () => {
    if (!job.value || !canSubmitSkillForm.value) return

    addingSkill.value = true
    try {
        // Create the skill
        const createdSkill = await createSkill({
            name: newSkillName.value.trim(),
            macroSkillId: selectedMacroSkillId.value
        })

        // Add skill to job with expected level
        await addSkillToJob(job.value._id, createdSkill._id, newSkillLevel.value)

        toast.add({
            title: 'Succès',
            description: 'Compétence créée et ajoutée avec succès',
            color: 'success'
        })

        // Reload job skills
        await loadJobSkills()

        closeAddSkillModal()
    } catch (err) {
        console.error('Failed to add skill:', err)
        toast.add({
            title: 'Erreur',
            description: 'Impossible de créer ou d\'ajouter la compétence',
            color: 'error'
        })
    } finally {
        addingSkill.value = false
    }
}

const handleUpdateSkillLevel = async (skillId: string, newLevel: number) => {
    if (!job.value) return

    const skill = jobSkills.value.find(s => s.skillId === skillId)
    if (!skill) return

    const oldLevel = skill.expectedLevel

    updatingSkillId.value = skillId
    try {
        await updateJobSkillLevel(job.value._id, skillId, newLevel)

        toast.add({
            title: 'Succès',
            description: `Niveau mis à jour de ${oldLevel} à ${newLevel}`,
            color: 'success'
        })

        // Reload job skills to get fresh data
        await loadJobSkills()
    } catch (err) {
        console.error('Failed to update skill level:', err)

        toast.add({
            title: 'Erreur',
            description: 'Impossible de mettre à jour le niveau',
            color: 'error'
        })

        // Reload to restore the old value
        await loadJobSkills()
    } finally {
        updatingSkillId.value = null
    }
}

const confirmDeleteSkill = async (skillId: string) => {
    if (!job.value) return

    const skill = jobSkills.value.find(s => s.skillId === skillId)
    const skillName = skill?.skillName || 'cette compétence'

    if (!confirm(`Êtes-vous sûr de vouloir retirer "${skillName}" de cet emploi ?\n\nAttention : La compétence sera également supprimée de la base de données.`)) {
        return
    }

    deletingSkillId.value = skillId
    try {
        await removeSkillFromJob(job.value._id, skillId)

        toast.add({
            title: 'Succès',
            description: 'Compétence retirée et supprimée avec succès',
            color: 'success'
        })

        // Reload job skills
        await loadJobSkills()
    } catch (err) {
        console.error('Failed to delete skill:', err)

        // Check if it's a conflict error (409)
        const error = err as { response?: { status?: number }; status?: number; data?: { message?: string }; message?: string }
        const isConflict = error?.response?.status === 409 || error?.status === 409
        const errorMessage = error?.data?.message || error?.message

        if (isConflict) {
            toast.add({
                title: 'Impossible de supprimer',
                description: errorMessage || 'Cette compétence est utilisée dans des évaluations existantes',
                color: 'error'
            })
        } else {
            toast.add({
                title: 'Erreur',
                description: 'Impossible de retirer la compétence',
                color: 'error'
            })
        }
    } finally {
        deletingSkillId.value = null
    }
}

const loadJob = async () => {
    loadingJob.value = true
    try {
        job.value = await getJobById(jobId.value)
    } catch (err) {
        console.error('Failed to load job:', err)
        toast.add({
            title: 'Erreur',
            description: 'Impossible de charger l\'emploi',
            color: 'error'
        })
    } finally {
        loadingJob.value = false
    }
}

const loadJobSkills = async () => {
    loadingSkills.value = true
    try {
        jobSkills.value = await getJobSkills(jobId.value)
    } catch (err) {
        console.error('Failed to load job skills:', err)
        toast.add({
            title: 'Erreur',
            description: 'Impossible de charger les compétences',
            color: 'error'
        })
    } finally {
        loadingSkills.value = false
    }
}

// Lifecycle
onMounted(async () => {
    try {
        await Promise.all([
            loadJob(),
            loadJobSkills()
        ])
    } catch (err) {
        console.error('Failed to load data:', err)
    }
})

// Head
useHead({
    title: computed(() => job.value ? `${job.value.name} - Emploi` : 'Emploi')
})
</script>
