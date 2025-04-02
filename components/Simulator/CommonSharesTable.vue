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
                        <th class="px-4 py-3.5 text-xs font-bold text-left w-[300px]">
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
                    <CommonSharesItem v-for="(share, index) in localCommonShares" :key="index" :share="share"
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
import { computed } from 'vue';
import type { CommonShare } from '~/types/simulationRequest';
import CommonSharesItem from './CommonSharesItem.vue';

// Define component props
const props = defineProps<{
    commonShares: CommonShare[];
}>();

// Define emits
const emit = defineEmits<{
    'update:common-shares': [shares: CommonShare[]];
}>();

// Create local reactive copy of props
const localCommonShares = computed({
    get: () => props.commonShares,
    set: (value) => emit('update:common-shares', value)
});

// Update a share
const updateShare = (index: number, updatedShare: CommonShare) => {
    const updatedShares = [...localCommonShares.value];
    updatedShares[index] = updatedShare;
    localCommonShares.value = updatedShares;
};

// Delete share with confirmation dialog
const deleteShare = (index: number) => {
    const updatedShares = [...localCommonShares.value];
    updatedShares.splice(index, 1);
    localCommonShares.value = updatedShares;
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
    const updatedShares = [...localCommonShares.value, newShare];
    localCommonShares.value = updatedShares;
};
</script>
