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

        <!-- Error State -->
        <UAlert v-else-if="error" icon="i-heroicons-exclamation-triangle" color="error" variant="soft"
            title="Erreur lors du chargement" :description="error" class="mb-6" />

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

            <!-- Skills Section - 2 Column Layout -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- Left Column: Macro Skills List -->
                <UCard variant="outline">
                    <template #header>
                        <div class="flex items-center gap-3">
                            <span class="text-lg font-semibold">Macro Compétences</span>
                            <UBadge color="info" variant="soft">{{ macroSkillsGrouped.length }}</UBadge>
                        </div>
                    </template>

                    <!-- Loading State -->
                    <div v-if="loadingSkills" class="flex justify-center items-center py-8">
                        <UIcon name="i-heroicons-arrow-path" class="animate-spin w-5 h-5" />
                        <span class="ml-2">Chargement...</span>
                    </div>

                    <!-- Macro Skills List -->
                    <div v-else-if="macroSkillsGrouped.length > 0">
                        <div v-for="macroSkill in macroSkillsGrouped" :key="macroSkill.macroSkillId"
                            class="p-4 cursor-pointer hover:bg-gray-50" :class="{
                                'bg-info-100 hover:bg-info-100': selectedMacroSkillId === macroSkill.macroSkillId
                            }" @click="selectMacroSkill(macroSkill.macroSkillId)">
                            <div class="flex items-start justify-between gap-2">
                                <div class="flex-1 min-w-0">
                                    <h3 class="font-medium text-gray-900 whitespace-normal break-words">
                                        {{ macroSkill.macroSkillName }}
                                    </h3>
                                    <p class="text-sm text-gray-500 mt-1">
                                        {{ macroSkill.macroSkillTypeName }}
                                    </p>
                                </div>
                                <UBadge :label="String(macroSkill.skills.length)" variant="soft" color="neutral"
                                    class="flex-shrink-0" />
                            </div>
                        </div>
                    </div>

                    <!-- Empty State -->
                    <div v-else class="text-center py-8">
                        <UIcon name="i-heroicons-document-text" class="w-10 h-10 text-gray-400 mx-auto mb-3" />
                        <p class="text-gray-600 text-sm">
                            Aucune compétence associée à cet emploi
                        </p>
                    </div>
                </UCard>

                <!-- Right Column: Micro Skills (Dynamic based on selection) -->
                <UCard variant="outline">
                    <template #header>
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-3">
                                <span class="text-lg font-semibold">
                                    {{ selectedMacroSkill ? 'Compétences' : 'Sélectionnez une macro compétence' }}
                                </span>
                                <UBadge v-if="selectedMicroSkills.length > 0" color="info" variant="soft">
                                    {{ selectedMicroSkills.length }}
                                </UBadge>
                            </div>
                            <UButton v-if="selectedMacroSkillId" icon="i-heroicons-plus" size="sm" color="info"
                                @click="openAddSkillModal">
                                Ajouter une compétence
                            </UButton>
                        </div>
                    </template>

                    <!-- Instruction State -->
                    <div v-if="!selectedMacroSkillId && macroSkillsGrouped.length > 0" class="text-center py-12">
                        <UIcon name="i-heroicons-cursor-arrow-rays" class="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 class="text-lg font-medium text-gray-900 mb-2">
                            Sélectionnez une macro compétence
                        </h3>
                        <p class="text-gray-600">
                            Cliquez sur une macro compétence à gauche pour voir ses compétences détaillées
                        </p>
                    </div>

                    <!-- Selected Macro Skill Info -->
                    <div v-else-if="selectedMacroSkill" class="space-y-4">

                        <!-- Micro Skills List -->
                        <div>
                            <div v-for="skill in selectedMicroSkills" :key="skill._id"
                                class="p-4 flex items-start justify-between gap-3 hover:bg-gray-50">
                                <div class="flex-1 min-w-0">
                                    <h4 class="font-medium text-gray-900 whitespace-normal break-words">
                                        {{ skill.skillName }}
                                    </h4>
                                </div>
                                <div class="flex items-center gap-2 flex-shrink-0">
                                    <UBadge v-if="skill.expectedLevel" :label="`Niveau ${skill.expectedLevel}`"
                                        variant="soft" color="info" />
                                    <span v-else class="text-sm text-gray-400">Aucun niveau</span>
                                    <UButton icon="i-heroicons-trash" size="xs" color="error" variant="ghost"
                                        :loading="deletingSkillId === skill.skillId"
                                        @click="confirmDeleteSkill(skill.skillId)" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Empty State when no skills -->
                    <div v-else class="text-center py-12">
                        <UIcon name="i-heroicons-document-text" class="w-10 h-10 text-gray-400 mx-auto mb-3" />
                        <p class="text-gray-600 text-sm">
                            Aucune compétence disponible
                        </p>
                    </div>
                </UCard>
            </div>
        </div>

        <!-- Add Skill Modal -->
        <UModal v-model:open="isAddSkillModalOpen" title="Ajouter une compétence">
            <template #body>
                <div class="p-6 flex flex-col gap-4">
                    <UFormField label="Nom de la compétence *">
                        <UInput v-model="newSkillName" placeholder="Entrez le nom de la compétence" class="w-full" />
                    </UFormField>

                    <UFormField label="Niveau attendu *">
                        <USelect v-model="expectedLevel" :items="levelOptions" :value-key="'value'" placeholder="Niveau"
                            class="w-full" />
                    </UFormField>

                    <div class="flex gap-2 justify-end mt-4">
                        <UButton color="neutral" variant="outline" @click="closeAddSkillModal">
                            Annuler
                        </UButton>
                        <UButton color="primary" variant="solid" :loading="addingSkill" :disabled="!canAddSkill"
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
import type { Job, JobSkillResponse } from '~/types/jobs'
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
const { error, getJobById, getJobSkills, addSkillToJob, removeSkillFromJob } = useJobs()
const { createSkill } = useSkills()

// Local state
const job = ref<Job | null>(null)
const jobSkills = ref<JobSkillResponse[]>([])
const loadingJob = ref(false)
const loadingSkills = ref(false)
const selectedMacroSkillId = ref<string | null>(null)

// Add skill modal state
const isAddSkillModalOpen = ref(false)
const newSkillName = ref('')
const expectedLevel = ref<number>(3)
const addingSkill = ref(false)

// Delete skill state
const deletingSkillId = ref<string | null>(null)

// Computed properties
const jobId = computed(() => route.params.id as string)

// Group skills by macro skill
const macroSkillsGrouped = computed(() => {
    const grouped = new Map<string, {
        macroSkillId: string
        macroSkillName: string
        macroSkillTypeId: string
        macroSkillTypeName: string
        skills: JobSkillResponse[]
    }>()

    jobSkills.value.forEach(skill => {
        if (!grouped.has(skill.macroSkillId)) {
            grouped.set(skill.macroSkillId, {
                macroSkillId: skill.macroSkillId,
                macroSkillName: skill.macroSkillName,
                macroSkillTypeId: skill.macroSkillTypeId,
                macroSkillTypeName: skill.macroSkillTypeName,
                skills: []
            })
        }
        grouped.get(skill.macroSkillId)!.skills.push(skill)
    })

    return Array.from(grouped.values()).sort((a, b) =>
        a.macroSkillName.localeCompare(b.macroSkillName)
    )
})

// Selected macro skill
const selectedMacroSkill = computed(() => {
    if (!selectedMacroSkillId.value) return null
    return macroSkillsGrouped.value.find(ms => ms.macroSkillId === selectedMacroSkillId.value) || null
})

// Micro skills for selected macro skill
const selectedMicroSkills = computed(() => {
    if (!selectedMacroSkill.value) return []
    return [...selectedMacroSkill.value.skills].sort((a, b) =>
        a.skillName.localeCompare(b.skillName)
    )
})

// Level options for the dropdown
const levelOptions = computed(() => [1, 2, 3, 4].map(v => ({
    label: useSkillLevelLabel(v),
    value: v
})))

// Validation for add skill form
const canAddSkill = computed(() => {
    return newSkillName.value.trim().length > 0 &&
        expectedLevel.value >= 1 &&
        expectedLevel.value <= 4
})

// Methods
const formatDate = (date: Date | string) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })
}

const selectMacroSkill = (macroSkillId: string) => {
    selectedMacroSkillId.value = macroSkillId
}

const openAddSkillModal = () => {
    isAddSkillModalOpen.value = true
}

const closeAddSkillModal = () => {
    isAddSkillModalOpen.value = false
    newSkillName.value = ''
    expectedLevel.value = 3
}

const handleAddSkill = async () => {
    if (!newSkillName.value.trim() || !job.value || !selectedMacroSkillId.value) return

    addingSkill.value = true
    try {
        // First, create the skill with the selected macro skill
        const createdSkill = await createSkill({
            name: newSkillName.value.trim(),
            macroSkillId: selectedMacroSkillId.value
        })

        // Then, add it to the job with the expected level
        await addSkillToJob(job.value._id, createdSkill._id, expectedLevel.value)

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

        // Auto-select first macro skill if available
        if (macroSkillsGrouped.value.length > 0) {
            const firstGroup = macroSkillsGrouped.value[0]
            if (firstGroup) {
                selectedMacroSkillId.value = firstGroup.macroSkillId
            }
        }
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
