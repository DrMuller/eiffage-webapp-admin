<template>
  <form id="simulationForm" @submit.prevent="createSimulation">
    <div class="header-container sticky top-0 backdrop-blur-sm bg-white/80 w-full z-10">
      <div class="px-6 py-4">
        <div class="flex justify-between items-center">
          <h1 class="text-2xl font-bold">Simulateur</h1>
          <div class="flex items-center gap-2">
            <UButton type="button" color="error" variant="ghost" icon="material-symbols-light:delete-outline"
              cursor-pointer @click="resetToDefault">
              Supprimer toute la saisie
            </UButton>
            <UButton type="button" variant="ghost" color="neutral" icon="material-symbols-light:file-copy"
              cursor-pointer @click="loadExample">
              Charger un exemple
            </UButton>
            <UButton type="submit" color="primary" icon="material-symbols-light:article" cursor-pointer>
              Créer la simulation
            </UButton>
          </div>
        </div>
      </div>
    </div>

    <!-- Content with a small top margin instead of large padding -->
    <div class="mt-4 px-6">
      <!-- <div class="bg-white p-6 rounded-lg shadow-md mb-8 max-w-xl"> -->
      <UCard variant="outline" class="max-w-xl mb-8">
        <template #header>
          <span class="text-lg font-semibold">Paramètres Principaux</span>
        </template>
        <div class="body">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label for="companyName" class="block mb-2 font-medium">Nom de la société</label>
              <UInput id="companyName" v-model="companyName" class="w-full" required />
            </div>
          </div>
        </div>
      </UCard>

      <!-- <div class="bg-white p-6 rounded-lg shadow-md mb-8"> -->
      <SimulatorCommonSharesTable class="mb-8" :common-shares="commonShares" @update:common-shares="updateCommonShares"
        @add:common-share="addCommonShare" />
      <!-- </div> -->

      <!-- <div class="bg-white p-6 rounded-lg shadow-md mb-8"> -->
      <SimulatorPreferredSharesTable v-model:preference-shares="preferenceShares" v-model:carve-out="carveOut"
        v-model:estimated-transfer-date="estimatedTransferDate" class="mb-8"
        @add:preference-share="addPreferenceShare" />
      <!-- </div> -->

      <!-- <div class="bg-white p-6 rounded-lg"> -->
      <SimulatorOptionsTable class="mb-8" :options="options" @update:options="updateOptions" @add:option="addOption" />
      <!-- </div> -->
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useSimulation } from '~/composables/useSimulation';
import type { CommonShare, Option, PrefShare, SimulationRequest } from '~/types/simulationRequest';
useHead({ title: 'Dashboard' })

// Define route meta
definePageMeta({
  middleware: ['auth'],
  requiresAuth: true
})

// Initialize reactive refs
const companyName = ref('');
const estimatedTransferDate = ref(new Date());
const commonShares = ref<CommonShare[]>([{
  name: `Capital social (prix de souscription = valeur nominale d'une action)`,
  date: new Date(),
  nb_shares: 0,
  share_price: 0,
  amount: 0
}]);
const preferenceShares = ref<PrefShare[]>([]);
const carveOut = ref(0);
const options = ref<Option[]>([]);

const { fetchLastSimulation } = useSimulation();
const simulation = await fetchLastSimulation();

if (simulation) {
  companyName.value = simulation.request.company_name;
  commonShares.value = simulation.request.common_shares;
  preferenceShares.value = simulation.request.pref_shares;
  options.value = simulation.request.options;
  carveOut.value = simulation.request.params.carve_out;
  estimatedTransferDate.value = simulation.request.params.estimated_transfer_date;
}

const updateCommonShares = (updatedShares: CommonShare[]) => {
  commonShares.value = updatedShares;
};

const addCommonShare = (newShare: CommonShare) => {
  commonShares.value = [...commonShares.value, newShare];
};

const addPreferenceShare = (newShare: PrefShare) => {
  preferenceShares.value = [...preferenceShares.value, newShare];
};

const updateOptions = (updatedOptions: Option[]) => {
  options.value = updatedOptions;
};

const addOption = (newOption: Option) => {
  options.value = [...options.value, newOption];
};

const resetToDefault = () => {
  companyName.value = '';
  estimatedTransferDate.value = new Date();
  commonShares.value = [{
    name: `Capital social (prix de souscription = valeur nominale d'une action)`,
    date: new Date(),
    nb_shares: 0,
    share_price: 0,
    amount: 0
  }];
  preferenceShares.value = [];
  carveOut.value = 0;
  options.value = [];
};

const loadExample = async () => {
  try {
    const exampleData = await import('~/assets/data/example-simulation.json');

    // Update the form with example data
    companyName.value = exampleData.request.company_name;

    // Convert dates from JSON format to Date objects
    const commonSharesWithDates = exampleData.request.common_shares.map((share: any) => ({
      ...share,
      date: new Date(share.date.$date)
    }));

    const prefSharesWithDates = exampleData.request.pref_shares.map((share: any) => ({
      ...share,
      pref_tri: share.pref_tri * 100, // Convert decimal to percentage
      date: new Date(share.date.$date)
    }));

    const optionsWithDates = exampleData.request.options.map((option: any) => ({
      ...option,
      date: new Date(option.date.$date)
    }));

    commonShares.value = commonSharesWithDates;
    preferenceShares.value = prefSharesWithDates;
    options.value = optionsWithDates;
    carveOut.value = exampleData.request.params.carve_out * 100; // Convert decimal to percentage
    estimatedTransferDate.value = new Date(exampleData.request.params.estimated_transfer_date.$date);

    // Show success notification
    // const toast = useToast();
    // toast.add({
    //   title: 'Exemple chargé',
    //   description: 'Les données d\'exemple ont été chargées avec succès',
    //   color: 'success'
    // });
  } catch (error) {
    // console.error('Failed to load example data:', error);
    // const toast = useToast();
    // toast.add({
    //   title: 'Erreur',
    //   description: 'Impossible de charger les données d\'exemple',
    //   color: 'error'
    // });
  }
};

const createSimulation = async () => {
  const request: SimulationRequest = {
    company_name: companyName.value,
    common_shares: commonShares.value,
    pref_shares: preferenceShares.value,
    options: options.value,
    params: {
      carve_out: carveOut.value,
      estimated_transfer_date: estimatedTransferDate.value
    }
  };
  const { createSimulation } = useSimulation();
  const result = await createSimulation(request);
  navigateTo(`/simulation/${result._id}`);
};
</script>

<style scoped>
.header-container {
  border-bottom: 1px solid #f0f0f0;
  min-height: 66px;
}
</style>