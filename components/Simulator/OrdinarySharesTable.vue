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
            <div v-if="!isAddingNewShare">
                <UButton variant="ghost" icon="i-heroicons-plus" class="text-sm" @click="startAddShare">
                    Ajouter une émission d'actions
                </UButton>
            </div>

            <div v-else class="my-2 p-4 bg-white rounded-lg">
                <h3 class="font-medium mb-3">Nouvelle émission d'actions</h3>
                <form @submit.prevent="addShare">
                    <div class="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label class="block text-sm mb-1">Intitulé de l'émission</label>
                            <UInput v-model="newShare.name" class="w-full" required />
                        </div>
                        <div>
                            <label class="block text-sm mb-1">Date de l'émission</label>
                            <DatePicker v-model="newShare.date" class="w-full" required />
                        </div>
                        <div>
                            <label class="block text-sm mb-1">Nombre d'action émises</label>
                            <UInput v-model.number="newShare.nb_shares" class="w-full" type="number" required
                                @update:model-value="updateNewAmount" />
                        </div>
                        <div>
                            <label class="block text-sm mb-1">Prix de souscription</label>
                            <UInput v-model.number="newShare.share_price" class="w-full" type="number" step="0.01"
                                required @update:model-value="updateNewAmount" />
                        </div>
                    </div>
                    <div class="flex justify-end gap-2">
                        <UButton color="neutral" variant="ghost" type="button" @click="cancelAddShare">Annuler</UButton>
                        <UButton color="primary" type="submit">Ajouter</UButton>
                    </div>
                </form>
            </div>
        </template>
    </UCard>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import type { OrdinaryShares } from '~/types/model';
import OrdinarySharesItem from './OrdinarySharesItem.vue';

// Define component props
const props = defineProps<{
    ordinaryShares: OrdinaryShares[];
}>();

// Define emits
const emit = defineEmits<{
    'update:ordinary-shares': [shares: OrdinaryShares[]];
    'add:ordinary-share': [share: OrdinaryShares];
}>();

// Create local reactive copy of props
const localOrdinaryShares = computed({
    get: () => props.ordinaryShares,
    set: (value) => emit('update:ordinary-shares', value)
});

const isAddingNewShare = ref(false);
const newShare = reactive<OrdinaryShares>({
    name: '',
    date: new Date(),
    nb_shares: 0,
    share_price: 0,
    amount: 0
});

// Update a share
const updateShare = (index: number, updatedShare: OrdinaryShares) => {
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

const startAddShare = () => {
    isAddingNewShare.value = true;
    Object.assign(newShare, {
        name: '',
        date: new Date(),
        nb_shares: 0,
        share_price: 0,
        amount: 0
    });
};

const cancelAddShare = () => {
    isAddingNewShare.value = false;
};

// Also update amount for new shares
const updateNewAmount = () => {
    newShare.amount = newShare.nb_shares * newShare.share_price;
};

const addShare = () => {
    // Make sure amount is calculated
    updateNewAmount();

    // Create a new share object (to avoid reference issues)
    const shareToAdd = {
        name: newShare.name,
        date: new Date(newShare.date),
        nb_shares: newShare.nb_shares,
        share_price: newShare.share_price,
        amount: newShare.amount
    };

    console.log('Adding new share:', shareToAdd);

    // Emit the event with the new share
    emit('add:ordinary-share', shareToAdd);

    // Reset the form
    isAddingNewShare.value = false;
};
</script>
