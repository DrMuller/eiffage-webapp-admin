<template>
    <div class="p-6 space-y-6">
        <div class="flex items-center justify-between">
            <div>
                <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Profil Employé</h1>
                <p class="text-gray-600 dark:text-gray-400 mt-2">Détails, compétences, évaluations et équipe</p>
            </div>
        </div>
        <div class="grid grid-cols-6 gap-4">
            <div class="col-span-4">
                <UCard>
                    <template #header>
                        <div class="flex items-center justify-between">
                            <span class="text-lg font-semibold">Profil</span>
                        </div>
                    </template>
                    <div class="flex items-center gap-4 space-y-2 p-4">
                        <div class="w-16 h-16 bg-gray-100 rounded-full p-2 flex items-center justify-center">
                            <Icon name="i-heroicons-user" class="w-8 h-8 text-gray-400" />
                        </div>
                        <div v-if="user">
                            <div>
                                <span class="font-bold">{{ user.firstName + ' ' + user.lastName }}</span>
                            </div>
                            <div>
                                <span>{{ user.code }}</span>
                            </div>
                            <div>
                                <span class="w-[200px]">{{ jobTitle }}</span>
                            </div>
                            <div class="mb-2 mt-2">
                                <UBadge variant="outline" color="secondary">{{ jobFamily }}</UBadge>
                            </div>
                            <div>
                                <span>{{ user.establishmentName }}</span>
                            </div>
                            <div>
                                <span>{{ user.companyName }}</span>
                            </div>
                            <div v-if="typeof user.seniority === 'number'">
                                <span class="text-gray-500">Ancienneté : </span>
                                <span class="font-medium">{{ user.seniority.toFixed(0) }} ans</span>
                            </div>
                            <div v-if="typeof user.age === 'number'">
                                <span class="text-gray-500">Âge : </span>
                                <span class="font-medium">{{ Math.round(user.age) }} ans</span>
                            </div>
                        </div>
                    </div>
                </UCard>
            </div>
            <UCard class="col-span-2" variant="outline">
                <template #header>
                    <div class="flex items-center justify-between">
                        <span class="text-lg font-semibold">Visualisation des compétences</span>
                    </div>
                </template>
                <div class="p-4 flex justify-center">
                    <div class="w-full max-w-lg">
                        <SkillsRadarChart v-if="skillsComparison.length > 0" :skills="skillsComparison"
                            :show-labels="false" />
                        <div v-else class="text-center text-gray-500 py-8">
                            Aucune compétence à afficher
                        </div>
                    </div>
                </div>
            </UCard>
        </div>

        <div v-if="managerUsers.length > 0" class="col-span-3">
            <UsersEmployeesTable :key="'managerUsers'" :users="managerUsers" :jobs="jobs" title="Managers" />
        </div>

        <!-- Team Statistics (only for managers) -->
        <div v-if="user?.roles?.includes('MANAGER')">
            <DashboardTeamStats :manager-id="userId" :hide-selector="true" />
        </div>

        <div v-if="managedUsers.length > 0" class="col-span-3">
            <UsersEmployeesTable :key="'managedUsers'" :users="managedUsers" :jobs="jobs" title="Equipe gérée" />
        </div>

        <UCard class="col-span-4" variant="outline">
            <template #header>
                <div class="flex items-center justify-between">
                    <span class="text-lg font-semibold">Compétences de l'emploi</span>
                </div>
            </template>
            <UTable :data="skillsComparison" :columns="skillsCols">
                <template #skillName-cell="{ row }">
                    <span class="text-gray-900 dark:text-white font-medium">
                        {{ row.original.skillName }}
                    </span>
                </template>
                <template #macroSkillTypeName-cell="{ row }">
                    <UBadge variant="soft" color="secondary">
                        {{ row.original.macroSkillTypeName }}
                    </UBadge>
                </template>
                <template #expectedLevel-cell="{ row }">
                    <span>
                        {{ useSkillLevelLabel(row.original.expectedLevel) }}
                    </span>
                </template>
                <template #currentLevel-cell="{ row }">
                    <span class="font-medium"
                        :class="getLevelColor(row.original.currentLevel, row.original.expectedLevel)">
                        {{ row.original.currentLevel !== null ? useSkillLevelLabel(row.original.currentLevel) : '—'
                        }}
                    </span>
                </template>
            </UTable>
        </UCard>
        <div class="grid grid-cols-6 gap-4">
            <UCard class="mb-4 col-span-4" variant="outline">
                <template #header>
                    <div class="flex items-center justify-between">
                        <span class="text-lg font-semibold">Evaluations</span>
                    </div>
                </template>
                <UTable :data="evaluationsWithManager" :columns="evaluationCols">
                    <template #managerName-cell="{ row }">
                        <span class="text-gray-900 dark:text-white">
                            {{ row.original.managerName }}
                        </span>
                    </template>
                    <template #createdAt-cell="{ row }">
                        <span class="text-gray-500 dark:text-gray-400">
                            {{ formatDate(row.original.createdAt) }}
                        </span>
                    </template>
                    <template #actions-cell="{ row }">
                        <UButton icon="i-heroicons-eye" color="neutral" variant="ghost" size="sm"
                            @click="openEvaluationModal(row.original._id)">
                            Détails
                        </UButton>
                    </template>
                </UTable>
            </UCard>
            <!-- Skill Levels Legend Card -->
            <UCard class="col-span-2" variant="outline">
                <template #header>
                    <div class="flex items-center justify-between">
                        <span class="text-lg font-semibold">Légende des niveaux de compétence</span>
                    </div>
                </template>
                <div class="flex flex-col gap-4 p-4">
                    <div v-for="level in skillLevels.filter(l => l.value > 0)" :key="level.value"
                        class="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div class="flex items-center gap-2 mb-2">
                            <span class="text-xl font-bold text-gray-900 dark:text-white">{{ level.value }}</span>
                            <span class="text-lg font-semibold text-gray-900 dark:text-white">{{ level.name }}</span>
                        </div>
                        <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">{{ level.definition }}</p>
                        <div v-if="level.example" class="text-xs text-gray-500 dark:text-gray-500 italic">
                            <span class="font-semibold">Exemple :</span> {{ level.example }}
                        </div>
                    </div>
                </div>
            </UCard>
        </div>

        <!-- Evaluation Details Modal -->
        <UModal v-model:open="isEvaluationModalOpen" class="max-w-3xl" title="Détails de l'évaluation">
            <template #body>
                <UCard v-if="selectedEvaluation">
                    <div class="flex justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                        <div>
                            <p class="text-sm text-gray-500 dark:text-gray-400">Evaluateur</p>
                            <p class="font-medium">{{ getManagerName(selectedEvaluation.managerUserId) }}</p>
                        </div>
                        <div>
                            <p class="text-sm text-gray-500 dark:text-gray-400">Date d'évaluation</p>
                            <p class="font-medium">{{ formatDate(selectedEvaluation.createdAt) }}</p>
                        </div>
                    </div>
                    <UTable :data="selectedEvaluationSkillsRows" :columns="evaluationSkillsCols">
                        <template #skillName-cell="{ row }">
                            <span class="text-gray-900 dark:text-white">
                                {{ row.original.skillName }}
                            </span>
                        </template>
                        <template #observedLevel-cell="{ row }">
                            <span class="font-medium" :class="getLevelColor(row.original.observedLevel ?? 0, 3)">
                                {{ row.original.observedLevel !== null ?
                                    useSkillLevelLabel(row.original.observedLevel) : '—' }}
                            </span>
                        </template>
                    </UTable>
                </UCard>
            </template>
        </UModal>
    </div>
</template>


<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import type { User } from '~/types/auth'
import type { Job, JobSkillResponse } from '~/types/jobs'
import type { Evaluation } from '~/types/evaluation'
import type { SkillLevel } from '~/composables/useSkillLevel'
import { useSkillLevelLabel, skillLevels } from '~/composables/useSkillLevel'

definePageMeta({ middleware: ['auth'], layout: 'default' })

const route = useRoute()
const toast = useToast()
const userId = computed(() => route.params.id as string)

// ========================================
// COMPOSABLES & STATE
// ========================================
const { getUserById, managers, getAllManagers, searchUsers } = useUsers()
const { getJobById, getJobSkills, jobs } = useJobs()
const { getEvaluationsByUserId, getEvaluationById } = useEvaluations()
const { getSkillLevelsByUserId } = useSkillLevel()

const user = ref<User | null>(null)
const currentJob = ref<Job | null>(null)
const jobSkillsRows = ref<JobSkillResponse[]>([])
const userSkillLevels = ref<SkillLevel[]>([])
const evaluations = ref<Evaluation[]>([])
const managedUsers = ref<User[]>([])
const managerUsers = ref<User[]>([])
const isEvaluationModalOpen = ref(false)
const selectedEvaluation = ref<Evaluation | null>(null)

// ========================================
// COMPUTED - USER & JOB INFO
// ========================================
const jobTitle = computed(() =>
    currentJob.value ? `${currentJob.value.name} (${currentJob.value.code})` : '—'
)

const jobFamily = computed(() =>
    currentJob.value?.jobFamily ?? '—'
)

// ========================================
// COMPUTED - SKILLS COMPARISON
// ========================================
interface SkillComparison {
    skillId: string
    skillName: string
    macroSkillTypeName: string
    expectedLevel: number
    currentLevel: number
}

const skillsComparison = computed<SkillComparison[]>(() => {
    return jobSkillsRows.value.map((jobSkill) => {
        const skillLevel = userSkillLevels.value.find((sl) => sl.skillId === jobSkill.skillId)

        return {
            skillId: jobSkill.skillId,
            skillName: jobSkill.skillName,
            macroSkillTypeName: jobSkill.macroSkillTypeName,
            expectedLevel: jobSkill.expectedLevel ?? 3,
            currentLevel: skillLevel?.level ?? 0,
        }
    })
})

const skillsCols = computed<TableColumn<SkillComparison>[]>(() => [
    { accessorKey: 'skillName', header: 'Compétence', meta: { class: { td: 'max-w-[600px] whitespace-normal break-words align-top' } } },
    { accessorKey: 'macroSkillTypeName', header: 'Type de macro compétence', meta: { class: { th: 'text-left', td: 'text-left' } } },
    { accessorKey: 'expectedLevel', header: 'Niveau attendu', meta: { class: { th: 'text-left', td: 'text-left' } } },
    { accessorKey: 'currentLevel', header: 'Niveau actuel', meta: { class: { th: 'text-left', td: 'text-left' } } },
])

// ========================================
// COMPUTED - EVALUATIONS
// ========================================
interface EvaluationWithManager extends Evaluation {
    managerName: string
}

const evaluationsWithManager = computed<EvaluationWithManager[]>(() => {
    return evaluations.value.map(evaluation => ({
        ...evaluation,
        managerName: getManagerName(evaluation.managerUserId)
    }))
})

const evaluationCols = computed<TableColumn<EvaluationWithManager>[]>(() => [
    { accessorKey: 'managerName', header: 'Evaluateur' },
    { accessorKey: 'createdAt', header: 'Date d\'évaluation' },
    { accessorKey: 'actions', header: 'Actions', meta: { class: { th: 'text-right', td: 'text-right' } } },
])

// ========================================
// COMPUTED - EVALUATION MODAL
// ========================================
interface EvaluationSkillRow {
    skillName: string
    observedLevel: number | null
}

const selectedEvaluationSkillsRows = computed<EvaluationSkillRow[]>(() => {
    if (!selectedEvaluation.value?.evaluationSkills) return []

    return (selectedEvaluation.value.evaluationSkills).map((evaluationSkill) => ({
        skillName: evaluationSkill.skill?.name ?? '',
        observedLevel: evaluationSkill.observedLevel ?? 0
    }))
})

const evaluationSkillsCols = computed<TableColumn<EvaluationSkillRow>[]>(() => [
    { accessorKey: 'skillName', header: 'Compétence', meta: { class: { td: 'max-w-[400px] whitespace-normal break-words' } } },
    { accessorKey: 'observedLevel', header: 'Niveau observé' },
])

// ========================================
// HELPER FUNCTIONS
// ========================================
function formatDate(d: string | Date) {
    const date = typeof d === 'string' ? new Date(d) : d
    return date.toLocaleDateString()
}

function getManagerName(managerUserId?: string): string {
    if (!managerUserId) return '—'
    const manager = managers.value.find(m => m._id === managerUserId)
    return manager ? `${manager.firstName} ${manager.lastName}` : '—'
}

function getLevelColor(currentLevel: number, expectedLevel: number): string {
    if (currentLevel === null) return 'text-gray-400'
    if (currentLevel >= expectedLevel) return 'text-green-600 dark:text-green-400 font-medium'
    if (currentLevel >= expectedLevel - 1.5) return 'text-warning-600 dark:text-warning-400 font-medium'
    return 'text-gray-600 dark:text-gray-400 font-medium'
}

async function openEvaluationModal(evaluationId: string) {
    try {
        isEvaluationModalOpen.value = true
        selectedEvaluation.value = null
        selectedEvaluation.value = await getEvaluationById(evaluationId)
    } catch {
        toast.add({
            title: 'Erreur',
            description: 'Impossible de charger les détails de l\'évaluation',
            color: 'error'
        })
        isEvaluationModalOpen.value = false
    }
}

// ========================================
// LIFECYCLE - DATA LOADING
// ========================================
onMounted(async () => {
    try {
        // 1. Fetch the employee by ID
        user.value = await getUserById(userId.value)

        // 2. Fetch managers (needed for evaluation display)
        if (managers.value.length === 0) {
            await getAllManagers()
        }

        // 3. Fetch job and job skills if user has a job
        if (user.value.jobId) {
            const [job, jobSkills] = await Promise.all([
                getJobById(user.value.jobId),
                getJobSkills(user.value.jobId)
            ])
            currentJob.value = job
            jobSkillsRows.value = jobSkills
        }

        // 4. Fetch user evaluations and skill levels
        const [evaluationsData, skillLevelsData] = await Promise.all([
            getEvaluationsByUserId(userId.value),
            getSkillLevelsByUserId(userId.value),
        ])

        evaluations.value = evaluationsData
        userSkillLevels.value = skillLevelsData

        // 5. Fetch managed users if user is a manager
        if (user.value.roles?.includes('MANAGER')) {
            managedUsers.value = await searchUsers({ managerUserId: user.value._id })
        }
        if (user.value.managerUserIds.length > 0) {
            for (const managerUserId of user.value.managerUserIds) {
                const manager = await getUserById(managerUserId)
                if (manager) {
                    managerUsers.value.push(manager)
                }
            }
        }

    } catch {
        toast.add({
            title: 'Erreur',
            description: 'Impossible de charger le profil',
            color: 'error'
        })
    }
})

</script>
