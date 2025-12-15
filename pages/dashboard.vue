<template>
  <div class="p-6">
    <!-- Page Header -->
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-gray-900">Tableau de bord</h1>
      <p class="text-gray-500 mt-2">Visualisation des données d'évaluation</p>
    </div>

    <div class="space-y-6">
      <!-- Team Stats -->
      <DashboardTeamStats />

      <!-- Evaluation Job Chart -->
      <DashboardEvaluationJobChart :jobs="jobs" :loading-jobs="loading" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { Job } from '~/types/jobs'

// Meta
definePageMeta({
  middleware: ['auth', 'admin'],
  layout: 'default'
})

// Composables
const { getJobs } = useJobs()
const toast = useToast()

// State
const jobs = ref<Job[]>([])
const loading = ref(false)

// Methods
const fetchJobs = async () => {
  loading.value = true
  try {
    jobs.value = await getJobs()
  } catch (err) {
    console.error('Failed to fetch jobs:', err)
    toast.add({
      title: 'Erreur',
      description: 'Impossible de charger la liste des emplois',
      color: 'error'
    })
  } finally {
    loading.value = false
  }
}

// Lifecycle
onMounted(() => {
  fetchJobs()
})

// Head
useHead({
  title: 'Tableau de bord'
})
</script>
