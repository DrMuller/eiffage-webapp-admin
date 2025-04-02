<template>
    <UCard variant="outline">
        <template #header>
            <span class="text-lg font-semibold mb-4">Historique - Les émissions d'actions de préférence</span>
        </template>

        <div class="body flex items-center">
            <label class="mr-4 font-medium">Carve-out distribué avant application des préférences (%)</label>
            <UInput v-model="localCarveOutValue" class="w-32" @update:model-value="updateCarveOut" />
            <UButton icon="material-symbols-light:info-outline-rounded" color="neutral" variant="ghost" class="ml-1"
                size="xs" aria-label="Info" />
            <label class="ml-4 font-medium">Date de la cession estimée</label>
            <DatePicker v-model="localEstimatedTransferDate" class="w-32"
                @update:model-value="updateEstimatedTransferDate" />
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
                                Rang
                                <UButton icon="material-symbols-light:info-outline-rounded" color="neutral"
                                    variant="ghost" class="ml-1" size="xs" aria-label="Info" />
                            </div>
                        </th>
                        <th class="px-4 py-3.5 text-xs font-bold text-left">
                            <div class="flex items-center">
                                Nb d'action émises
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
                        <th class="px-4 py-3.5 text-xs font-bold text-left">
                            <div class="flex items-center">
                                Type de participation
                                <UButton icon="material-symbols-light:info-outline-rounded" color="neutral"
                                    variant="ghost" class="ml-1" size="xs" aria-label="Info" />
                            </div>
                        </th>
                        <th class="px-4 py-3.5 text-xs font-bold text-left">
                            <div class="flex items-center">
                                Multiple
                                <UButton icon="material-symbols-light:info-outline-rounded" color="neutral"
                                    variant="ghost" class="ml-1" size="xs" aria-label="Info" />
                            </div>
                        </th>
                        <th class="px-4 py-3.5 text-xs font-bold text-left">
                            <div class="flex items-center">
                                TRI (%)
                                <UButton icon="material-symbols-light:info-outline-rounded" color="neutral"
                                    variant="ghost" class="ml-1" size="xs" aria-label="Info" />
                            </div>
                        </th>
                        <th class="px-4 py-3.5 text-xs font-bold" />
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-200 bg-white">
                    <PreferredSharesItem v-for="(share, index) in localPreferenceShares" :key="index" :share="share"
                        :index="index" @update="updateShare" @delete="deleteShare" />
                </tbody>
            </table>
        </div>

        <template #footer>
            <div>
                <UButton variant="ghost" icon="i-heroicons-plus" class="text-sm" @click="addNewShare">
                    Ajouter une émission d'actions de préférence
                </UButton>
            </div>
        </template>
    </UCard>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import type { PrefShare } from '~/types/simulationRequest';
import PreferredSharesItem from './PreferredSharesItem.vue';

// Define component props
const props = defineProps<{
    preferenceShares: PrefShare[];
    carveOut: number;
    estimatedTransferDate: Date;
}>();

// Define emits
const emit = defineEmits<{
    'update:preference-shares': [shares: PrefShare[]];
    'update:carve-out': [value: number];
    'update:estimated-transfer-date': [date: Date];
}>();

// Create local reactive copies of the props
const localPreferenceShares = computed({
    get: () => props.preferenceShares,
    set: (value) => emit('update:preference-shares', value)
});

const localCarveOutValue = computed({
    get: () => props.carveOut,
    set: (value) => emit('update:carve-out', value)
});

const localEstimatedTransferDate = computed({
    get: () => props.estimatedTransferDate,
    set: (value) => emit('update:estimated-transfer-date', value)
});

// Update carve out value
const updateCarveOut = () => {
    emit('update:carve-out', localCarveOutValue.value);
};

// Update estimated transfer date
const updateEstimatedTransferDate = () => {
    emit('update:estimated-transfer-date', localEstimatedTransferDate.value);
};

// Update a share
const updateShare = (index: number, updatedShare: PrefShare) => {
    const updatedShares = [...localPreferenceShares.value];
    updatedShares[index] = updatedShare;
    localPreferenceShares.value = updatedShares;
};

// Delete share
const deleteShare = (index: number) => {
    const updatedShares = [...localPreferenceShares.value];
    updatedShares.splice(index, 1);
    localPreferenceShares.value = updatedShares;
};

// Add a new empty preferred share directly to the table
const addNewShare = () => {
    const newShare: PrefShare = {
        name: 'Nouvelle émission préférence',
        date: new Date(),
        seniority: 1,
        nb_shares: 0,
        share_price: 0,
        amount: 0,
        pref_type: 'NP',
        pref_multiple: 1,
        pref_tri: 0,
        pref_effective_multiple: 1,
        pref_share_price: 0,
        pref_amount: 0
    };

    // Add the new share to the local array
    const updatedShares = [...localPreferenceShares.value, newShare];
    localPreferenceShares.value = updatedShares;
};
</script>