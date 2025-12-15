<template>
  <UCard variant="outline">
    <template #header>
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-semibold">Statistiques d'équipe</h2>
      </div>
    </template>

    <div class="grid grid-cols-1 lg:grid-cols-3">
      <div class="col-span-1 lg:col-span-1 p-4">
        <!-- Manager Selection -->
        <UFormField v-if="!hideSelector" label="Sélectionner un manager">
          <USelectMenu v-model="selectedManagerId" :items="managerOptions" :value-key="'value'" searchable
            searchable-placeholder="Rechercher un manager..." :loading="loadingManagers"
            placeholder="Sélectionner un manager" class="w-full" />
        </UFormField>
      </div>
      <div class="col-span-1 lg:col-span-3 p-4">
        <!-- Loading State -->
        <div v-if="loadingStats" class="flex justify-center items-center py-12">
          <UIcon name="i-heroicons-arrow-path" class="animate-spin w-6 h-6" />
          <span class="ml-2">Chargement des statistiques...</span>
        </div>

        <!-- Stats Display -->
        <div v-else-if="stats" class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Team Info Card -->
          <UCard variant="outline" class="bg-gradient-to-br from-slate-50 to-slate-100">
            <div class="space-y-4 p-4">
              <div class="flex items-center gap-3">
                <div class="p-3 bg-primary-100 rounded-xl">
                  <UIcon name="i-heroicons-user-group" class="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-500">Manager</p>
                  <p class="text-lg font-semibold text-gray-900">{{ stats.managerName }}</p>
                </div>
              </div>
              <div class="flex items-center justify-between pt-3 border-t border-gray-200">
                <span class="text-sm text-gray-500">Taille de l'équipe</span>
                <UBadge :label="`${stats.teamSize} collaborateurs`" variant="soft" color="primary" size="lg" />
              </div>
            </div>
          </UCard>

          <!-- Current Campaign Card -->
          <UCard variant="outline" class="bg-gradient-to-br from-amber-50 to-orange-50">
            <div class="space-y-4 p-4">
              <div class="flex items-center gap-3">
                <div class="p-3 bg-amber-100 rounded-xl">
                  <UIcon name="i-heroicons-calendar-days" class="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-500">Campagne en cours</p>
                  <p v-if="stats.currentCampaign" class="text-lg font-semibold text-gray-900">
                    {{ useFormatDate(stats.currentCampaign.startDate) }} - {{
                      useFormatDate(stats.currentCampaign.endDate)
                    }}
                  </p>
                  <p v-else class="text-lg font-semibold text-gray-500">Aucune campagne active</p>
                </div>
              </div>
            </div>
          </UCard>

          <!-- Key Skills Mastery Card -->
          <UCard variant="outline" class="md:col-span-1">
            <div class="space-y-4 p-4">
              <div class="flex items-center gap-3">
                <div class="p-3 bg-emerald-100 rounded-xl">
                  <UIcon name="i-heroicons-academic-cap" class="w-6 h-6 text-emerald-600" />
                </div>
                <div class="flex-1">
                  <p class="text-sm font-medium text-gray-500">Compétences clés maîtrisées</p>
                  <p class="text-xs text-gray-400">Niveau observé ≥ niveau attendu</p>
                </div>
              </div>

              <!-- Progress Ring -->
              <div class="flex items-center justify-center py-4">
                <div class="relative">
                  <svg class="w-32 h-32 transform -rotate-90">
                    <circle cx="64" cy="64" r="56" stroke="currentColor" stroke-width="12" fill="none"
                      class="text-gray-200" />
                    <circle cx="64" cy="64" r="56" stroke="currentColor" stroke-width="12" fill="none"
                      :stroke-dasharray="circumference" :stroke-dashoffset="masteryOffset" stroke-linecap="round"
                      class="text-emerald-500 transition-all duration-700 ease-out" />
                  </svg>
                  <div class="absolute inset-0 flex flex-col items-center justify-center">
                    <span class="text-3xl font-bold text-gray-900">{{ stats.keySkillsMastery.percentage }}%</span>
                  </div>
                </div>
              </div>

              <div class="flex items-center justify-between pt-3 border-t border-gray-200">
                <span class="text-sm text-gray-500">Compétences maîtrisées</span>
                <span class="text-sm font-medium text-gray-900">
                  {{ stats.keySkillsMastery.masteredSkillsCount }} / {{ stats.keySkillsMastery.totalEvaluatedSkillsCount
                  }}
                </span>
              </div>
            </div>
          </UCard>

          <!-- Evaluation Progress Card -->
          <UCard variant="outline" class="md:col-span-1">
            <div class="space-y-4 p-4">
              <div class="flex items-center gap-3">
                <div class="p-3 bg-blue-100 rounded-xl">
                  <UIcon name="i-heroicons-clipboard-document-check" class="w-6 h-6 text-blue-600" />
                </div>
                <div class="flex-1">
                  <p class="text-sm font-medium text-gray-500">Avancement des évaluations</p>
                  <p class="text-xs text-gray-400">Collaborateurs évalués (campagne en cours)</p>
                </div>
              </div>

              <!-- Progress Ring -->
              <div class="flex items-center justify-center py-4">
                <div class="relative">
                  <svg class="w-32 h-32 transform -rotate-90">
                    <circle cx="64" cy="64" r="56" stroke="currentColor" stroke-width="12" fill="none"
                      class="text-gray-200" />
                    <circle cx="64" cy="64" r="56" stroke="currentColor" stroke-width="12" fill="none"
                      :stroke-dasharray="circumference" :stroke-dashoffset="progressOffset" stroke-linecap="round"
                      class="text-blue-500 transition-all duration-700 ease-out" />
                  </svg>
                  <div class="absolute inset-0 flex flex-col items-center justify-center">
                    <span class="text-3xl font-bold text-gray-900">{{ stats.evaluationProgress.percentage }}%</span>
                  </div>
                </div>
              </div>

              <div class="flex items-center justify-between pt-3 border-t border-gray-200">
                <span class="text-sm text-gray-500">Collaborateurs évalués</span>
                <span class="text-sm font-medium text-gray-900">
                  {{ stats.evaluationProgress.evaluatedMembersCount }} / {{ stats.evaluationProgress.totalMembersCount
                  }}
                </span>
              </div>

              <!-- No Campaign Warning -->
              <div v-if="!stats.currentCampaign" class="flex items-center gap-2 p-3 bg-amber-50 rounded-lg">
                <UIcon name="i-heroicons-exclamation-triangle" class="w-5 h-5 text-amber-500" />
                <span class="text-sm text-amber-700">Aucune campagne active</span>
              </div>
            </div>
          </UCard>
        </div>

        <!-- Empty State -->
        <div v-else class="text-center py-12">
          <UIcon name="i-heroicons-user-group" class="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 class="text-lg font-medium text-gray-900 mb-2">Sélectionnez un manager</h3>
          <p class="text-sm text-gray-500">
            Choisissez un manager pour visualiser les statistiques de son équipe
          </p>
        </div>
      </div>

    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'
import type { User } from '~/types/auth'
import type { TeamStats } from '~/composables/useUsers'
import { useFormatDate } from '~/composables/useFormatter'

// Props
interface Props {
  managerId?: string
  hideSelector?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  managerId: undefined,
  hideSelector: false
})

// Composables
const { getAllManagers, getTeamStats, managers: managersRef } = useUsers()
const toast = useToast()

// State
const selectedManagerId = ref<string>(props.managerId || '')
const stats = ref<TeamStats | null>(null)
const loadingManagers = ref(false)
const loadingStats = ref(false)

// Circle constants for progress rings
const circumference = 2 * Math.PI * 56

// Computed
const managerOptions = computed(() =>
  managersRef.value.map((manager: User) => ({
    label: `${manager.firstName} ${manager.lastName}`,
    value: manager._id
  }))
)

const masteryOffset = computed(() => {
  if (!stats.value) return circumference
  const percentage = stats.value.keySkillsMastery.percentage
  return circumference - (percentage / 100) * circumference
})

const progressOffset = computed(() => {
  if (!stats.value) return circumference
  const percentage = stats.value.evaluationProgress.percentage
  return circumference - (percentage / 100) * circumference
})

// Methods
const fetchManagers = async () => {
  loadingManagers.value = true
  try {
    await getAllManagers()
  } catch (err) {
    console.error('Failed to fetch managers:', err)
    toast.add({
      title: 'Erreur',
      description: 'Impossible de charger la liste des managers',
      color: 'error'
    })
  } finally {
    loadingManagers.value = false
  }
}

const fetchStats = async () => {
  if (!selectedManagerId.value) return

  loadingStats.value = true
  try {
    stats.value = await getTeamStats(selectedManagerId.value)
  } catch (err) {
    console.error('Failed to fetch team stats:', err)
    toast.add({
      title: 'Erreur',
      description: 'Impossible de charger les statistiques de l\'équipe',
      color: 'error'
    })
    stats.value = null
  } finally {
    loadingStats.value = false
  }
}

// Watch for manager selection changes
watch(selectedManagerId, () => {
  if (selectedManagerId.value) {
    fetchStats()
  } else {
    stats.value = null
  }
})

// Lifecycle
onMounted(() => {
  fetchManagers()
  // If managerId is provided via props, fetch stats immediately
  if (props.managerId) {
    fetchStats()
  }
})
</script>
