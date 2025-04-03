<template>
  <form id="simulationForm" @submit.prevent="createSimulation">
    <div class="header-container sticky top-0 backdrop-blur-sm bg-white/80 w-full z-10">
      <div class="px-6 py-4">
        <div class="flex justify-between items-center">
          <h1 class="text-2xl font-bold">Simulateur</h1>
          <div class="flex items-center">
            <UButton type="submit" color="primary" icon="material-symbols-light:article" cursor-pointer>
              Créer la simulation
            </UButton>
            <UButton type="button" variant="ghost" icon="material-symbols-light:delete-outline" cursor-pointer
              class="ml-2" @click="resetToDefault">
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
      <SimulatorPreferredSharesTable class="mb-8" v-model:preference-shares="preferenceShares"
        v-model:carve-out="carveOut" v-model:estimated-transfer-date="estimatedTransferDate"
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
  console.log('Request:', request);
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