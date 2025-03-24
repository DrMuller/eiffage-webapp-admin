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
import { ref } from 'vue';
import type { OrdinaryShares, Options } from '~/types/model';

useHead({ title: 'Dashboard' })

// Define route meta
definePageMeta({
  middleware: ['auth'],
  requiresAuth: true
})

// Basic company information
const companyName = ref('Acme');
const estimatedTransferDate = ref(new Date('01/10/2027'));

// Ordinary shares data
const ordinaryShares = ref<OrdinaryShares[]>([
  {
    name: 'AO fondateurs',
    date: new Date(),
    nb_shares: 9900,
    share_price: 40.00,
    amount: 396000.00
  },
  {
    name: 'AO C-levels',
    date: new Date('04/12/2024'),
    nb_shares: 3685,
    share_price: 312.00,
    amount: 1149720.00
  }
]);

console.log(ordinaryShares.value);

// Preference shares data
interface PreferenceShare {
  title: string;
  date: Date;
  liquidationRank: number;
  shares: number;
  price: number;
  participationType: string;
  multiple: number;
  tri: number;
}

const preferenceShares = ref<PreferenceShare[]>([
  {
    title: 'PRE SEED 2021',
    date: new Date('02/01/2021'),
    liquidationRank: 2,
    shares: 9900,
    price: 40.00,
    participationType: 'Non participating',
    multiple: 1,
    tri: 16
  },
  {
    title: 'SEED 2022',
    date: new Date('04/12/2022'),
    liquidationRank: 1,
    shares: 3685,
    price: 312.00,
    participationType: 'Non participating',
    multiple: 1,
    tri: 18
  },
  {
    title: 'SEED 2022',
    date: new Date('04/12/2022'),
    liquidationRank: 1,
    shares: 3685,
    price: 312.00,
    participationType: 'Non participating',
    multiple: 1,
    tri: 18
  },
  {
    title: 'SEED 2022',
    date: new Date('04/12/2022'),
    liquidationRank: 1,
    shares: 3685,
    price: 312.00,
    participationType: 'Non participating',
    multiple: 1,
    tri: 18
  },
  {
    title: 'SEED 2022',
    date: new Date('04/12/2022'),
    liquidationRank: 1,
    shares: 3685,
    price: 312.00,
    participationType: 'Non participating',
    multiple: 1,
    tri: 18
  },
  {
    title: 'SEED 2022',
    date: new Date('04/12/2022'),
    liquidationRank: 1,
    shares: 3685,
    price: 312.00,
    participationType: 'Non participating',
    multiple: 1,
    tri: 18
  }
]);

const carveOutValue = ref('10');

// Options data
const options = ref<Options[]>([
  {
    name: 'BSPCE 2022',
    date: new Date('04/12/2022'),
    nb_options: 464,
    strike: 280.30,
    nb_dead_options: 0,
    nb_alive_options: 464
  }
]);

// Update handlers for each table
const updateOrdinaryShares = (updatedShares: OrdinaryShares[]) => {
  ordinaryShares.value = updatedShares;
};

const addOrdinaryShare = (newShare: OrdinaryShares) => {
  console.log('Parent received new share:', newShare);
  ordinaryShares.value = [...ordinaryShares.value, newShare];
};

const updatePreferenceShares = (updatedShares: PreferenceShare[]) => {
  preferenceShares.value = updatedShares;
};

const updateCarveOut = (value: string) => {
  carveOutValue.value = value;
};

const addPreferenceShare = (newShare: PreferenceShare) => {
  console.log('Parent received new preference share:', newShare);
  preferenceShares.value = [...preferenceShares.value, newShare];
};

const updateOptions = (updatedOptions: Options[]) => {
  options.value = updatedOptions;
};

const addOption = (newOption: Options) => {
  console.log('Parent received new option:', newOption);
  options.value = [...options.value, newOption];
};

const createSimulation = () => {
  // Implementation for creating a simulation would go here
  console.log('Creating simulation with data:', {
    companyName: companyName.value,
    estimatedTransferDate: estimatedTransferDate.value,
    ordinaryShares: ordinaryShares.value,
    preferenceShares: preferenceShares.value,
    carveOutValue: carveOutValue.value,
    options: options.value
  });
};
</script>

<style scoped>
.header-container {
  border-bottom: 1px solid #f0f0f0;
  min-height: 66px;
}
</style>