<template>
  <div class="client-detail-page p-6">
    <div v-if="loading" class="flex justify-center py-16">
      <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-gray-500" />
    </div>

    <div v-else-if="client">
      <!-- Client header -->
      <div class="mb-8 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <NuxtLink to="/dossier" class="text-gray-500 hover:text-gray-700">
            <UIcon name="i-heroicons-arrow-left" class="w-5 h-5" />
          </NuxtLink>

          <div class="client-logo flex items-center justify-center bg-gray-100 overflow-hidden">
            <img v-if="client.logoUrl" :src="client.logoUrl" :alt="client.companyName"
              class="w-full h-full object-cover">
            <UIcon v-else name="i-heroicons-building-office" class="w-8 h-8 text-gray-500" />
          </div>

          <div>
            <h1 class="text-2xl font-bold">{{ client.companyName }}</h1>
            <p class="text-sm text-gray-500">SIREN: {{ client.siren }}</p>
          </div>
        </div>

        <div>
          <NuxtLink :to="`/dossier/${clientId}/simulation`">
            <UButton color="primary" icon="i-heroicons-chart-bar">
              Simulation
            </UButton>
          </NuxtLink>
        </div>
      </div>

      <!-- Client information -->
      <UCard class="mb-8">
        <template #header>
          <h2 class="text-lg font-semibold">Informations</h2>
        </template>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8 p-8">
          <div>
            <p class="text-sm font-medium text-gray-500 mb-1">Nom de la société</p>
            <p>{{ client.companyName }}</p>
          </div>

          <div>
            <p class="text-sm font-medium text-gray-500 mb-1">SIREN</p>
            <p>{{ client.siren }}</p>
          </div>

          <div>
            <p class="text-sm font-medium text-gray-500 mb-1">Nom du contact</p>
            <p>{{ client.contactName }}</p>
          </div>

          <div>
            <p class="text-sm font-medium text-gray-500 mb-1">Email du contact</p>
            <p>{{ client.contactEmail }}</p>
          </div>

          <div>
            <p class="text-sm font-medium text-gray-500 mb-1">Date de création</p>
            <p>{{ formatDate(client.createdAt) }}</p>
          </div>
        </div>
      </UCard>
    </div>

    <div v-else-if="error" class="text-center py-16">
      <UIcon name="i-heroicons-exclamation-circle" class="w-12 h-12 mx-auto mb-4 text-red-500" />
      <p class="text-lg text-red-500">{{ error }}</p>
      <NuxtLink to="/dossier" class="text-primary mt-4 inline-block">
        Retour à la liste des clients
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Client } from '~/types/client'

// Define route meta
definePageMeta({
  middleware: ['auth'],
  requiresAuth: true
})

// Get client details from route param
const route = useRoute()
const clientId = computed(() => route.params.id as string)

// Get client composable
const { loading, error, fetchClientById } = useClient()

// Client state
const client = ref<Client | null>(null)

// Format date helper
const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date)
}

// Fetch client on page load
onMounted(async () => {
  const data = await fetchClientById(clientId.value)
  if (data) {
    client.value = data
  }
})

</script>

<style scoped>
.client-logo {
  width: 48px;
  height: 48px;
  border-radius: 10px;
}
</style>
