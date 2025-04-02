<template>
    <div class="p-6 space-y-6">
        <div class="flex items-center justify-between">
            <div>
                <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Profil Employé</h1>
                <p class="text-gray-600 dark:text-gray-400 mt-2">Détails, compétences, évaluations et équipe</p>
            </div>
            <UButton icon="i-heroicons-arrow-left" color="neutral" variant="ghost" @click="onBack">Retour</UButton>
        </div>

        <div class="grid grid-cols-3 gap-4">
            <!-- Profile Card -->
            <UCard class="col-span-1" variant="outline">
                <template #header>
                    <div class="flex items-center justify-between">
                        <span class="text-lg font-semibold">Profil</span>
                    </div>
                </template>
                <div class="space-y-2 p-4">
                    <div class="flex justify-between"><span class="text-gray-500">Matricule</span><span>{{ user?.code
                    }}</span></div>
                    <div class="flex justify-between"><span class="text-gray-500">Rôle(s)</span>
                        <span class="flex gap-1 flex-wrap">
                            <UBadge v-for="r in user?.roles || []" :key="r" :label="r" size="sm"
                                :color="getRoleColor(r)" :variant="getRoleVariant(r)" />
                        </span>
                    </div>
                    <div class="flex justify-between"><span class="text-gray-500">Emploi</span><span>{{ jobTitle
                    }}</span></div>
                </div>
            </UCard>
            <!-- Managed Users Card (if Manager) -->
            <UsersTable class="col-span-2" :users="managedUsers" :jobs="jobs" title="Equipe gérée" :editable="false" />
        </div>

        <div class="">

            <SkillsTable class="mb-4" :skills="skillsForJob" :loading="loadingJobSkills" :error="null"
                title="Compétences du métier" @refresh="refreshJobSkills" />

            <UCard class="mb-4" variant="outline">
                <template #header>
                    <div class="flex items-center justify-between">
                        <span class="text-lg font-semibold">Evaluations</span>
                    </div>
                </template>
                <UTable :data="evaluations" :columns="evaluationCols">
                    <template #createdAt-cell="{ row }">
                        <span class="text-gray-500 dark:text-gray-400">
                            {{ formatDate(row.original.createdAt) }}
                        </span>
                    </template>
                </UTable>
            </Ucard>
        </div>
    </div>
</template>


<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import type { Role, User } from '~/types/auth'
import type { Job, JobSkillLink } from '~/types/jobs'
import SkillsTable from '~/components/Skills/SkillsTable.vue'
import type { Skill } from '~/types/skills'
import type { Evaluation } from '~/types/evaluation'

definePageMeta({ middleware: ['auth'], layout: 'default' })

const route = useRoute()
const toast = useToast()

// Composables
const { users, managers, getAllManagers, getAllUsers } = useUsers()
const { getJobs, jobs } = useJobs()
const { getEvaluationsByUserId } = useEvaluations()
const { $api } = useNuxtApp()

const user = computed<User | undefined>(() => users.value.find((u) => u._id === (route.params.id as string)))

const jobTitle = computed(() => {
    console.log(currentJob.value)
    return currentJob.value ? `${currentJob.value.name} (${currentJob.value.code})` : '—'
})

const currentJob = computed<Job | null>(() => {
    console.log(user.value)
    console.log("jobs", jobs.value)
    const id = user.value?.jobId
    if (!id) return null
    return jobs.value.find((j: Job) => j._id === id) ?? null
})

// Job skills table data
const jobSkillsRows = ref<JobSkillLink[]>([])
const skillsForJob = computed<Skill[]>(() => jobSkillsRows.value.map((l) => l.skill))
const loadingJobSkills = ref(false)

// Evaluations table
const evaluationCols = computed<TableColumn<Evaluation>[]>(() => [
    { accessorKey: 'userCode', header: 'Matricule' },
    { accessorKey: 'managerUserName', header: 'Manager' },
    { accessorKey: 'createdAt', header: 'Date' },
])
const evaluations = ref<Evaluation[]>([])

// Managed users
const managedUsers = ref<User[]>([])

function formatDate(d: string | Date) {
    const date = typeof d === 'string' ? new Date(d) : d
    return date.toLocaleDateString()
}

const getRoleColor = (role: Role) => (role === 'ADMIN' || role === 'MANAGER' ? 'secondary' : 'neutral')
const getRoleVariant = (_role: Role): 'solid' | 'outline' | 'soft' => 'soft'

function onBack() {
    navigateTo('/users')
}

onMounted(async () => {
    try {
        if (users.value.length === 0) await getAllUsers()
        if (managers.value.length === 0) await getAllManagers()

        await refreshJobSkills()
        await getJobs()

        // Fetch evaluations for this user
        const userId = route.params.id as string
        evaluations.value = await getEvaluationsByUserId(userId)

        // If user is MANAGER, find managed users (users with managerUserId == userId)
        if ((user.value?.roles || []).includes('MANAGER')) {
            managedUsers.value = users.value.filter((u) => u.managerUserId === userId)
        }
    } catch {
        toast.add({ title: 'Erreur', description: 'Impossible de charger le profil', color: 'error' })
    }
})

async function refreshJobSkills() {
    const jobId = user.value?.jobId
    if (!jobId) return
    loadingJobSkills.value = true
    try {
        jobSkillsRows.value = await $api<JobSkillLink[]>(`/jobs/${jobId}/skills`, { method: 'GET' })
    } finally {
        loadingJobSkills.value = false
    }
}
</script>
