<template>
  <UCard variant="outline">
    <template #header>
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-semibold">Répartition des niveaux par compétence</h2>
      </div>
    </template>

    <div class="p-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left Column: Job Selection & Details -->
      <div class="lg:col-span-1 space-y-4">
        <!-- Job Selection -->
        <UFormField label="Sélectionner un emploi">
          <USelectMenu v-model="selectedJobId" :items="jobOptions" :value-key="'value'" searchable
            searchable-placeholder="Rechercher un emploi..." :loading="loadingJobs" placeholder="Sélectionner un emploi"
            class="w-full" />
        </UFormField>

        <!-- Job Details -->
        <UCard v-if="selectedJob" variant="outline">
          <template #header>
            <h3 class="text-lg font-semibold">Détails de l'emploi</h3>
          </template>
          <div class="p-4 space-y-3">
            <div>
              <label class="text-sm font-medium text-gray-500">Nom</label>
              <p class="text-gray-900 mt-1">{{ selectedJob.name }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-500">Code</label>
              <p class="text-gray-900 mt-1">
                <UBadge :label="selectedJob.code" variant="soft" color="neutral" />
              </p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-500">Profil</label>
              <p class="text-gray-900 mt-1 text-sm">{{ selectedJob.jobProfile }}</p>
            </div>
            <div v-if="selectedJob.jobFamily">
              <label class="text-sm font-medium text-gray-500">Famille</label>
              <p class="text-gray-900 mt-1">
                <UBadge :label="selectedJob.jobFamily" variant="soft" color="info" />
              </p>
            </div>
            <div v-if="distribution.length > 0">
              <label class="text-sm font-medium text-gray-500">Compétences</label>
              <p class="text-gray-900 mt-1">
                <UBadge :label="`${distribution.length}`" variant="soft" color="primary" />
              </p>
            </div>
          </div>
        </UCard>

        <!-- Empty State for Job Selection -->
        <UCard v-else variant="outline">
          <div class="text-center py-8">
            <UIcon name="i-heroicons-briefcase" class="w-10 h-10 text-gray-400 mx-auto mb-3" />
            <p class="text-sm text-gray-500">
              Sélectionnez un emploi pour voir ses détails
            </p>
          </div>
        </UCard>
      </div>

      <!-- Right Column: Chart -->
      <div class="lg:col-span-2">
        <!-- Loading State -->
        <div v-if="loadingDistribution" class="flex justify-center items-center py-12">
          <UIcon name="i-heroicons-arrow-path" class="animate-spin w-6 h-6" />
          <span class="ml-2">Chargement des données...</span>
        </div>

        <!-- Chart -->
        <div v-else-if="selectedJobId && chartData && chartData.labels.length > 0" class="chart-container">
          <Bar :data="chartData" :options="chartOptions" />
        </div>

        <!-- Empty State - No Data -->
        <div v-else-if="selectedJobId" class="text-center py-12">
          <UIcon name="i-heroicons-chart-bar" class="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 class="text-lg font-medium text-gray-900 mb-2">
            Aucune donnée disponible
          </h3>
          <p class="text-sm text-gray-500">
            Aucune évaluation n'a été effectuée pour cet emploi
          </p>
        </div>

        <!-- Empty State - No Job Selected -->
        <div v-else class="text-center py-12">
          <UIcon name="i-heroicons-chart-pie" class="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 class="text-lg font-medium text-gray-900 mb-2">
            Aucun emploi sélectionné
          </h3>
          <p class="text-sm text-gray-500">
            Choisissez un emploi pour visualiser la répartition des niveaux de compétences
          </p>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  type TooltipItem,
} from 'chart.js'
import type { Job, JobSkillLevelDistribution } from '~/types/jobs'

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

// Props
interface Props {
  jobs: Job[]
  loadingJobs?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loadingJobs: false
})

// Composables
const { getJobSkillLevelDistribution } = useJobs()
const toast = useToast()

// State
const selectedJobId = ref<string>('')
const distribution = ref<JobSkillLevelDistribution[]>([])
const loadingDistribution = ref(false)

// Computed
const jobOptions = computed(() =>
  props.jobs.map(job => ({
    label: `${job.name} (${job.code})`,
    value: job._id
  }))
)

const selectedJob = computed(() => {
  if (!selectedJobId.value) return null
  return props.jobs.find(job => job._id === selectedJobId.value) || null
})

// Chart colors for levels 0-4
// Color palette: Sophisticated progression from cool to warm tones
const levelColors = {
  0: 'rgba(38, 70, 83, 0.85)',    // Charcoal Blue - Sophisticated navy for "no level"
  1: 'rgba(42, 157, 143, 0.85)',  // Verdigris - Serene tropical blue-green for beginner
  2: 'rgba(233, 196, 106, 0.85)', // Jasmine - Mellow golden for intermediate
  3: 'rgba(244, 162, 97, 0.85)',  // Sandy Brown - Warm orange-brown for advanced
  4: 'rgba(231, 111, 81, 0.85)'   // Burnt Peach - Fiery bold for expert
}

const levelBorderColors = {
  0: 'rgba(38, 70, 83, 1)',       // Charcoal Blue #264653
  1: 'rgba(42, 157, 143, 1)',     // Verdigris #2A9D8F
  2: 'rgba(233, 196, 106, 1)',    // Jasmine #E9C46A
  3: 'rgba(244, 162, 97, 1)',     // Sandy Brown #F4A261
  4: 'rgba(231, 111, 81, 1)'      // Burnt Peach #E76F51
}

const chartData = computed(() => {
  if (!distribution.value || distribution.value.length === 0) {
    return { labels: [], datasets: [] }
  }

  // Split long labels into multiple lines for better readability
  const labels = distribution.value.map(item => {
    const maxLength = 35
    const maxLines = 3 // Maximum number of lines before truncating

    if (item.skillName.length <= maxLength) {
      return item.skillName
    }

    const words = item.skillName.split(' ')
    const lines: string[] = []
    let currentLine = ''

    words.forEach(word => {
      if ((currentLine + ' ' + word).trim().length > maxLength) {
        if (currentLine) {
          lines.push(currentLine)
        }
        currentLine = word
      } else {
        currentLine = currentLine ? currentLine + ' ' + word : word
      }
    })
    if (currentLine) lines.push(currentLine)

    // Truncate if exceeds max lines
    if (lines.length > maxLines) {
      const truncatedLines = lines.slice(0, maxLines)
      // Add ellipsis to the last line
      const lastLine = truncatedLines[maxLines - 1]
      if (lastLine) {
        truncatedLines[maxLines - 1] = lastLine.substring(0, maxLength - 3) + '...'
      }
      return truncatedLines
    }

    return lines
  })

  // Create datasets for each level (0-4)
  const datasets = []

  for (let level = 0; level <= 4; level++) {
    datasets.push({
      label: `Niveau ${level}`,
      data: distribution.value.map(item => item.levelDistribution[level] || 0),
      backgroundColor: levelColors[level as keyof typeof levelColors],
      borderColor: levelBorderColors[level as keyof typeof levelBorderColors],
      borderWidth: 1,
    })
  }

  return { labels, datasets }
})

const chartOptions = computed(() => ({
  indexAxis: 'y' as const, // Horizontal bar chart
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: {
      stacked: true,
      title: {
        display: true,
        text: 'Nombre d\'employés',
        color: 'rgb(75, 85, 99)', // gray-600
        font: {
          size: 12,
          weight: 'normal' as const,
        },
      },
      ticks: {
        stepSize: 1,
        color: 'rgb(107, 114, 128)', // gray-500
      },
      grid: {
        color: 'rgba(107, 114, 128, 0.1)',
      },
    },
    y: {
      stacked: true,
      ticks: {
        color: 'rgb(17, 24, 39)', // gray-900
        font: {
          size: 11,
        },
        autoSkip: false,
        maxRotation: 0,
        minRotation: 0,
      },
      grid: {
        display: false,
      },
    },
  },
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: {
        color: 'rgb(17, 24, 39)', // gray-900
        font: {
          size: 13,
          weight: 'normal' as const,
        },
        padding: 15,
        usePointStyle: true,
      },
    },
    tooltip: {
      backgroundColor: 'rgba(17, 24, 39, 0.9)',
      padding: 12,
      titleFont: {
        size: 13,
      },
      bodyFont: {
        size: 12,
      },
      displayColors: true,
      callbacks: {
        // Don't show skill name in tooltip title
        title: () => '',
        label: (context: TooltipItem<'bar'>) => {
          const label = context.dataset.label || ''
          const value = context.parsed.x || 0
          return `${label}: ${value} employé${value > 1 ? 's' : ''}`
        }
      }
    },
  },
}))

// Methods
const fetchDistribution = async () => {
  if (!selectedJobId.value) return

  loadingDistribution.value = true
  try {
    distribution.value = await getJobSkillLevelDistribution(selectedJobId.value)
  } catch (err) {
    console.error('Failed to fetch skill distribution:', err)
    toast.add({
      title: 'Erreur',
      description: 'Impossible de charger la répartition des niveaux',
      color: 'error'
    })
    distribution.value = []
  } finally {
    loadingDistribution.value = false
  }
}

// Watch for job selection changes
watch(selectedJobId, () => {
  if (selectedJobId.value) {
    fetchDistribution()
  } else {
    distribution.value = []
  }
})
</script>

<style scoped>
.chart-container {
  min-height: 600px;
  max-width: 100%;
  position: relative;
}

/* Give more space to y-axis labels */
.chart-container :deep(canvas) {
  padding-left: 20px;
}
</style>
