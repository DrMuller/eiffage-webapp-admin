<template>
    <UCard variant="outline">
        <template #header>
            <span class="text-lg font-semibold mb-4">Historique - Les émissions d'actions ordinaires non
                labellisées</span>
        </template>

        <div class="flex items-center body">
            <label class="mr-4 font-medium">Valeur nominale par action</label>
            <UInput class="w-32" placeholder="18 200" />
            <UButton icon="material-symbols-light:info-outline-rounded" color="neutral" variant="ghost" class="ml-1"
                size="xs" aria-label="Info" />
        </div>

        <div class="relative overflow-auto">
            <table class="min-w-full border-collapse">
                <thead class="top-0 border-b-1 border-t-1 border-gray-200 bg-white">
                    <tr>
                        <th class="px-4 py-3.5 text-xs font-bold text-left">
                            <div class="flex items-center">
                                Intitulé de l'émission
                                <UButton icon="material-symbols-light:info-outline-rounded" color="neutral"
                                    variant="ghost" class="ml-1" size="xs" aria-label="Info" />
                            </div>
                        </th>
                        <th class="px-4 py-3.5 text-xs font-bold text-left">
                            <div class="flex items-center">
                                Date de l'émission
                                <UButton icon="material-symbols-light:info-outline-rounded" color="neutral"
                                    variant="ghost" class="ml-1" size="xs" aria-label="Info" />
                            </div>
                        </th>
                        <th class="px-4 py-3.5 text-xs font-bold text-left">
                            <div class="flex items-center">
                                Nombre d'action émises
                                <UButton icon="material-symbols-light:info-outline-rounded" color="neutral"
                                    variant="ghost" class="ml-1" size="xs" aria-label="Info" />
                            </div>
                        </th>
                        <th class="px-4 py-3.5 text-xs font-bold text-left">
                            <div class="flex items-center">
                                Prix de souscription
                                <UButton icon="material-symbols-light:info-outline-rounded" color="neutral"
                                    variant="ghost" class="ml-1" size="xs" aria-label="Info" />
                            </div>
                        </th>
                        <th class="px-4 py-3.5 text-xs font-bold" />
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-200 bg-white">
                    <OrdinarySharesItem v-for="(share, index) in localOrdinaryShares" :key="index" :share="share"
                        :index="index" @update="updateShare" @delete="deleteShare" />
                </tbody>
            </table>
        </div>

        <template #footer>
            <div>
                <UButton variant="ghost" icon="i-heroicons-plus" class="text-sm" @click="addNewShare">
                    Ajouter une émission d'actions
                </UButton>
            </div>
        </template>
    </UCard>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import type { CommonShare } from '~/types/simulationRequest';
import OrdinarySharesItem from './OrdinarySharesItem.vue';

// Define component props
const props = defineProps<{
    ordinaryShares: CommonShare[];
}>();

// Define emits
const emit = defineEmits<{
    'update:ordinary-shares': [shares: CommonShare[]];
}>();

// Create local reactive copy of props
const localOrdinaryShares = computed({
    get: () => props.ordinaryShares,
    set: (value) => emit('update:ordinary-shares', value)
});

// Update a share
const updateShare = (index: number, updatedShare: CommonShare) => {
    const updatedShares = [...localOrdinaryShares.value];
    updatedShares[index] = updatedShare;
    localOrdinaryShares.value = updatedShares;
};

// Delete share with confirmation dialog
const deleteShare = (index: number) => {
    const updatedShares = [...localOrdinaryShares.value];
    updatedShares.splice(index, 1);
    localOrdinaryShares.value = updatedShares;
};

// Add a new empty share directly to the table
const addNewShare = () => {
    const newShare = {
        name: 'Nouvelle émission',
        date: new Date(),
        nb_shares: 0,
        share_price: 0,
        amount: 0
    };

    // Add the new share to the local array
    const updatedShares = [...localOrdinaryShares.value, newShare];
    localOrdinaryShares.value = updatedShares;
};
</script>
