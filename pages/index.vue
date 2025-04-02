<template>
  <div>
    <div class="header-container sticky top-0 backdrop-blur-sm bg-white/80 w-full z-10">
      <div class="px-6 py-4">
        <div class="flex justify-between items-center">
          <h1 class="text-2xl font-bold">Simulateur</h1>
          <UButton color="primary" icon="i-heroicons-document-text" cursor-pointer @click="createSimulation">
            Créer la simulation
          </UButton>
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
              <label class="block mb-2 font-medium">Nom de la société</label>
              <UInput v-model="companyName" class="w-full" />
            </div>
            <div>
              <label class="block mb-2 font-medium">Date de la cession estimée</label>
              <DatePicker v-model="estimatedTransferDate" class="w-full" />
            </div>
          </div>
        </div>
      </UCard>

      <!-- <div class="bg-white p-6 rounded-lg shadow-md mb-8"> -->
      <SimulatorOrdinarySharesTable class="mb-8" :ordinary-shares="ordinaryShares"
        @update:ordinary-shares="updateOrdinaryShares" @add:ordinary-share="addOrdinaryShare" />
      <!-- </div> -->

      <!-- <div class="bg-white p-6 rounded-lg shadow-md mb-8"> -->
      <SimulatorPreferredSharesTable class="mb-8" :preference-shares="preferenceShares" :carve-out-value="carveOutValue"
        @update:preference-shares="updatePreferenceShares" @update:carve-out="updateCarveOut"
        @add:preference-share="addPreferenceShare" />
      <!-- </div> -->

      <!-- <div class="bg-white p-6 rounded-lg"> -->
      <SimulatorOptionsTable class="mb-8" :options="options" @update:options="updateOptions" @add:option="addOption" />
      <!-- </div> -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useSimulation } from '~/composables/useSimulation';
import type { Simulation } from '~/types/simulation';
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
const ordinaryShares = ref<CommonShare[]>([]);
const preferenceShares = ref<PrefShare[]>([]);
const carveOutValue = ref('');
const options = ref<Option[]>([]);

// Interface for JSON data (with string dates)
interface SimulationJsonData {
  companyName: string;
  estimatedTransferDate: string;
  ordinaryShares: Array<{
    name: string;
    date: string;
    nb_shares: number;
    share_price: number;
    amount: number;
  }>;
  preferenceShares: Array<{
    title: string;
    date: string;
    liquidationRank: number;
    shares: number;
    price: number;
    participationType: string;
    multiple: number;
    tri: number;
  }>;
  carveOutValue: string;
  options: Array<{
    name: string;
    date: string;
    nb_options: number;
    strike: number;
    nb_dead_options: number;
    nb_alive_options: number;
  }>;
}

// Function to transform JSON data to proper types
const transformData = (jsonData: SimulationJsonData) => {
  return {
    companyName: jsonData.companyName,
    estimatedTransferDate: new Date(jsonData.estimatedTransferDate),
    ordinaryShares: jsonData.ordinaryShares.map(share => ({
      ...share,
      date: new Date(share.date)
    })) as CommonShare[],
    preferenceShares: jsonData.preferenceShares.map(share => {
      const amount = share.shares * share.price;
      const pref_amount = amount * share.multiple;

      return {
        name: share.title,
        date: new Date(share.date),
        seniority: share.liquidationRank,
        nb_shares: share.shares,
        share_price: share.price,
        amount: amount,
        pref_type: share.participationType,
        pref_multiple: share.multiple,
        pref_tri: share.tri,
        pref_effective_multiple: share.multiple, // This might need a different calculation
        pref_pps: share.price, // This might need a different calculation
        pref_amount: pref_amount
      };
    }) as PreferredShares[],
    carveOutValue: jsonData.carveOutValue,
    options: jsonData.options.map(option => ({
      ...option,
      date: new Date(option.date)
    })) as Options[]
  };
};

// Load initial data
onMounted(async () => {
  try {
    const { fetchLastSimulation } = useSimulation();
    const simulation = await fetchLastSimulation();

    if (simulation) {
      companyName.value = simulation.request.company_name;
      // Use current date as default for estimated transfer date
      estimatedTransferDate.value = new Date();
      ordinaryShares.value = simulation.request.common_shares;
      preferenceShares.value = simulation.request.pref_shares;
      // Use empty string as default for carve out value
      carveOutValue.value = '';
      options.value = simulation.request.options;
    } else {
      // Fallback to JSON data if no simulation exists
      // const response = await fetch('/data/initial-simulation.json');
      // const jsonData: SimulationJsonData = await response.json();
      // const transformedData = transformData(jsonData);

      // // Update reactive refs with transformed data
      // companyName.value = transformedData.companyName;
      // estimatedTransferDate.value = transformedData.estimatedTransferDate;
      // ordinaryShares.value = transformedData.ordinaryShares;
      // preferenceShares.value = transformedData.preferenceShares;
      // carveOutValue.value = transformedData.carveOutValue;
      // options.value = transformedData.options;
    }
  } catch (error) {
    console.error('Error loading simulation data:', error);
  }
});

// Update handlers for each table
const updateOrdinaryShares = (updatedShares: CommonShare[]) => {
  ordinaryShares.value = updatedShares;
};

const addOrdinaryShare = (newShare: CommonShare) => {
  console.log('Parent received new share:', newShare);
  ordinaryShares.value = [...ordinaryShares.value, newShare];
};

const updatePreferenceShares = (updatedShares: PrefShare[]) => {
  preferenceShares.value = updatedShares;
};

const updateCarveOut = (value: string) => {
  carveOutValue.value = value;
};

const addPreferenceShare = (newShare: PrefShare) => {
  console.log('Parent received new preference share:', newShare);
  preferenceShares.value = [...preferenceShares.value, newShare];
};

const updateOptions = (updatedOptions: Option[]) => {
  options.value = updatedOptions;
};

const addOption = (newOption: Option) => {
  console.log('Parent received new option:', newOption);
  options.value = [...options.value, newOption];
};

const createSimulation = async () => {
  const request: SimulationRequest = {
    company_name: companyName.value,
    common_shares: ordinaryShares.value,
    pref_shares: preferenceShares.value,
    options: options.value,
    params: {
      nominal: 0,
      carve_out: 0
    }
  };
  const { createSimulation } = useSimulation();
  const result = await createSimulation(request);
  console.log('Simulation created:', result);
};
</script>

<style scoped>
.header-container {
  border-bottom: 1px solid #f0f0f0;
  min-height: 66px;
}
</style>