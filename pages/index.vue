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

    <CaptableRequest :captable-request="captableRequest" @update:captable-request="captableRequest = $event" />
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useSimulation } from '~/composables/useSimulation';
import type { SimulationRequest } from '~/types/simulation';
import type { CaptableRequest } from '~/types/captable';

useHead({ title: 'Dashboard' })

// Define route meta
definePageMeta({
  middleware: ['auth'],
  requiresAuth: true
})

// Initialize captable request
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

const { fetchLastSimulation } = useSimulation();
const simulation = await fetchLastSimulation();

if (simulation) {
  captableRequest.value = {
    common_shares: simulation.request.common_shares,
    pref_shares: simulation.request.pref_shares,
    options: simulation.request.options,
    params: {
      carve_out: simulation.request.params.carve_out,
      estimated_transfer_date: simulation.request.params.estimated_transfer_date
    }
  };
}

const resetToDefault = () => {
  captableRequest.value = {
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
  };
};

// Add interfaces for JSON data with string dates
interface JsonCommonShare {
  name: string;
  date: string;
  nb_shares: number;
  share_price: number;
  amount: number;
}

interface JsonPrefShare {
  name: string;
  date: string;
  seniority: number;
  nb_shares: number;
  share_price: number;
  amount: number;
  pref_type: string;
  pref_multiple: number;
  pref_tri?: number;
  pref_effective_multiple: number;
  pref_share_price: number;
  pref_amount: number;
  net_pref_amount?: number;
}

interface JsonOption {
  name: string;
  date: string;
  nb_options: number;
  strike: number;
  nb_dead_options: number;
  nb_alive_options: number;
}

const loadExample = async () => {
  try {
    const exampleData = await import('~/assets/data/example-simulation.json');

    // Convert dates from JSON format to Date objects
    const commonSharesWithDates = exampleData.request.common_shares.map((share: JsonCommonShare) => ({
      ...share,
      date: new Date(share.date)
    }));

    const prefSharesWithDates = exampleData.request.pref_shares.map((share: JsonPrefShare) => {
      // Map string pref_type to the literal union type 'P' | 'NP'
      const prefType: 'P' | 'NP' = share.pref_type === 'participating' ? 'P' : 'NP';

      return {
        name: share.name,
        date: new Date(share.date),
        seniority: share.seniority,
        nb_shares: share.nb_shares,
        share_price: share.share_price,
        amount: share.amount,
        pref_type: prefType,
        pref_multiple: share.pref_multiple,
        pref_tri: share.pref_tri ? share.pref_tri * 100 : undefined
      };
    });

    const optionsWithDates = exampleData.request.options.map((option: JsonOption) => ({
      ...option,
      date: new Date(option.date)
    }));

    captableRequest.value = {
      common_shares: commonSharesWithDates,
      pref_shares: prefSharesWithDates,
      options: optionsWithDates,
      params: {
        carve_out: exampleData.request.params.carve_out * 100, // Convert decimal to percentage
        estimated_transfer_date: new Date(exampleData.request.params.estimated_transfer_date)
      }
    };
  } catch (error) {
    console.error('Failed to load example data:', error);
  }
};

const createSimulation = async () => {
  const request: SimulationRequest = {
    clientId: '123',
    captable: captableRequest.value
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