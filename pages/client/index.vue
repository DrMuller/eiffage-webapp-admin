<template>
  <div class="clients-page p-6">
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-2xl font-bold">Vos clients</h1>
      <UModal title="Ajouter un nouveau client" :ui="{ content: 'min-w-280' }">
        <UButton color="primary" icon="material-symbols-light:add" @click="openAddClientModal">
          Ajouter un nouveau client
        </UButton>
        <template #body>
          <div>
            <!-- Stepper -->
            <div class="flex items-center justify-center py-6 px-6 border-b">
              <div class="flex items-center">
                <div class="flex items-center">
                  <UButton :color="currentStep === 1 ? 'primary' : 'neutral'" variant="solid"
                    class="rounded-full w-8 h-8 flex items-center justify-center" size="xs">
                    1
                  </UButton>
                  <span class="ml-2 font-medium">Informations Générales</span>
                </div>
                <div class="flex items-center mx-2">
                  <UIcon name="i-heroicons-chevron-right" class="w-5 h-5 text-gray-400" />
                </div>
                <div class="flex items-center">
                  <UButton :color="currentStep === 2 ? 'primary' : 'neutral'" variant="solid"
                    class="rounded-full w-8 h-8 flex items-center justify-center" size="xs">
                    2
                  </UButton>
                  <span class="ml-2 font-medium">Historique</span>
                </div>
                <div class="flex items-center mx-2">
                  <UIcon name="i-heroicons-chevron-right" class="w-5 h-5 text-gray-400" />
                </div>
                <div class="flex items-center">
                  <UButton :color="currentStep === 3 ? 'primary' : 'neutral'" variant="solid"
                    class="rounded-full w-8 h-8 flex items-center justify-center" size="xs">
                    3
                  </UButton>
                  <span class="ml-2 font-medium">Vérification</span>
                </div>
              </div>
            </div>

            <div v-if="currentStep === 1">
              <h2 class="text-xl font-bold text-center my-6">Nouveau dossier</h2>
              <p class="text-center mb-8">Veuillez remplir ces informations pour créer l'espace dédié à votre client.
              </p>
              <ClientCreateForm :initial-data="newClient" :loading="createLoading" @next="handleStep1Complete" />
            </div>

            <!-- step 2 -->
            <div v-if="currentStep === 2">
              <form id="createCaptableForm" @submit.prevent="handleStep2Complete">
                <CaptableRequest :captable-request="captableRequest"
                  @update:captable-request="captableRequest = $event" />
                <div class="flex justify-between m-6">
                  <UButton type="button" color="primary" variant="ghost" @click="currentStep = 1">
                    <UIcon name="i-heroicons-arrow-left" class="w-4 h-4 ml-1" />
                    Précédent
                  </UButton>
                  <UButton type="submit" color="primary" :disabled="createLoading">
                    Étape suivante
                    <UIcon name="i-heroicons-arrow-right" class="w-4 h-4 ml-1" />
                  </UButton>
                </div>
              </form>
            </div>

            <!-- step 3 -->
            <div v-if="currentStep === 3">
              <CaptablePreview :captable-request="captableRequest" />
              <div class="flex justify-between m-6">
                <UButton type="button" color="primary" variant="ghost" @click="currentStep = 2">
                  <UIcon name="i-heroicons-arrow-left" class="w-4 h-4 ml-1" />
                  Précédent
                </UButton>
                <UButton type="button" color="primary" :disabled="createLoading" @click="submitNewClient">
                  Valider
                  <UIcon name="i-heroicons-arrow-right" class="w-4 h-4 ml-1" />
                </UButton>
              </div>
            </div>
          </div>
        </template>
      </UModal>
    </div>

    <!-- Active cases section -->
    <div class="mb-12">
      <h2 class="text-xl font-semibold mb-4">Dossiers en cours</h2>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="client in clients" :key="client._id"
          class="flex items-center bg-gray-100 border border-gray-200 rounded-lg px-5 py-4 gap-4 min-w-[260px]">
          <div class="client-logo w-8 h-8 flex items-center justify-center bg-gray-100 overflow-hidden">
            <img v-if="client.logoUrl" :src="client.logoUrl" :alt="client.companyName"
              class="w-full h-full object-cover">
            <UIcon v-else name="i-heroicons-building-office" class="w-5 h-5 text-gray-500" />
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="font-medium text-base truncate">{{ client.companyName }}</h3>
          </div>
          <UButton variant="ghost" class="flex items-center gap-1 whitespace-nowrap px-2 py-1 text-sm bg-white"
            @click="viewClientFile(client._id)">
            Accéder au dossier
            <UIcon name="i-heroicons-arrow-right" class="w-4 h-4" />
          </UButton>
        </div>
      </div>

      <div v-if="loading" class="flex justify-center py-8">
        <UIcon name="i-heroicons-arrow-path" class="w-6 h-6 animate-spin text-gray-500" />
      </div>

      <div v-if="clients.length === 0 && !loading" class="text-center py-10 text-gray-500">
        <UIcon name="i-heroicons-folder-open" class="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <p class="text-lg">Aucun client trouvé</p>
        <p class="text-sm">Commencez par ajouter un nouveau client</p>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { CaptableRequest } from '~/types/captable'

// Get client composable
const { clients, loading, fetchClients, createClient, uploadClientLogo } = useClient()
const { createCaptable } = useCaptable()

// Fetch clients on page load
onMounted(async () => {
  await fetchClients()
})

// Form step handling
const currentStep = ref(1)
const nextStep = () => {
  if (currentStep.value < 3) {
    currentStep.value++
  } else {
    submitNewClient()
  }
}

// New client data
const createLoading = ref(false)
const selectedLogo = ref<File | null>(null)
const newClient = ref({
  companyName: '',
  contactName: '',
  contactEmail: '',
  siren: '',
})

const captableRequest = ref<CaptableRequest>({
  common_shares: [{
    name: `Capital social (prix de souscription = valeur nominale d'une action)`,
    date: new Date(),
    nb_shares: 0,
    share_price: 0,
    amount: 0
  }],
  pref_shares: [],
  options: [],
  params: {
    carve_out: 0,
    estimated_transfer_date: undefined
  }
});


// Handle step 1 completion
const handleStep1Complete = (data: {
  clientData: {
    companyName: string
    contactName: string
    contactEmail: string
    siren: string
  },
  logo: File | null
}) => {
  // Update client data
  newClient.value = { ...data.clientData }
  // Update logo
  selectedLogo.value = data.logo
  // Go to next step
  nextStep()
}

// Handle step 2 completion
const handleStep2Complete = () => {
  nextStep()
}

// Open add client modal
const openAddClientModal = () => {
  currentStep.value = 1
  newClient.value = {
    companyName: '',
    contactName: '',
    contactEmail: '',
    siren: ''
  }
  selectedLogo.value = null
}

// Submit new client
const submitNewClient = async () => {
  createLoading.value = true
  try {
    const createdClient = await createClient({
      ...newClient.value,
    })

    // Upload logo if provided
    if (createdClient && selectedLogo.value) {
      await uploadClientLogo(createdClient._id, selectedLogo.value)
      // Post captable request
      await createCaptable(createdClient._id, captableRequest.value)
    }


    // Reset form and close modal (handled by parent component)
    currentStep.value = 1
    // newClient.value = {
    //   companyName: '',
    //   contactName: '',
    //   contactEmail: '',
    //   siren: ''
    // }
  } catch (err) {
    console.error('Error creating client:', err)
  } finally {
    createLoading.value = false
  }
}

// View client file
const router = useRouter()
const viewClientFile = (clientId: string) => {
  router.push(`/client/${clientId}`)
}
</script>


<style scoped>
.client-logo {
  border-radius: 5px;
}
</style>
