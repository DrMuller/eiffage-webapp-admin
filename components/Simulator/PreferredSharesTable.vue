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
            <div v-if="!isAddingNewShare">
                <UButton variant="ghost" icon="i-heroicons-plus" class="text-sm" @click="startAddShare">
                    Ajouter une émission d'actions de préférence
                </UButton>
            </div>

            <div v-else class="my-2 p-4 bg-white rounded-lg">
                <h3 class="font-medium mb-3">Nouvelle émission d'actions de préférence</h3>
                <form @submit.prevent="addShare">
                    <div class="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label class="block text-sm mb-1">Intitulé de l'émission</label>
                            <UInput v-model="newShare.title" class="w-full" required />
                        </div>
                        <div>
                            <label class="block text-sm mb-1">Date de l'émission</label>
                            <DatePicker v-model="newShare.date" class="w-full" required />
                        </div>
                        <div>
                            <label class="block text-sm mb-1">Rang</label>
                            <UInput v-model.number="newShare.liquidationRank" class="w-full" type="number" min="1"
                                required />
                        </div>
                        <div>
                            <label class="block text-sm mb-1">Nombre d'action émises</label>
                            <UInput v-model.number="newShare.shares" class="w-full" type="number" required />
                        </div>
                        <div>
                            <label class="block text-sm mb-1">Prix de souscription</label>
                            <UInput v-model.number="newShare.price" class="w-full" type="number" step="0.01" required />
                        </div>
                        <div>
                            <label class="block text-sm mb-1">Type de participation</label>
                            <USelect v-model="newShare.participationType" class="w-full"
                                :options="['Participating', 'Non participating']" required />
                        </div>
                        <div>
                            <label class="block text-sm mb-1">Multiple</label>
                            <UInput v-model.number="newShare.multiple" class="w-full" type="number" step="0.1" min="1"
                                required />
                        </div>
                        <div>
                            <label class="block text-sm mb-1">TRI (%)</label>
                            <UInput v-model.number="newShare.tri" class="w-full" type="number" required />
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
import PreferredSharesItem from './PreferredSharesItem.vue';

// Define the interface for a preference share
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

// Define component props
const props = defineProps<{
    preferenceShares: PreferenceShare[];
    carveOutValue: string;
}>();

// Define emits
const emit = defineEmits<{
    'update:preference-shares': [shares: PreferenceShare[]];
    'update:carve-out': [value: string];
    'add:preference-share': [share: PreferenceShare];
}>();

// Create local reactive copies of the props
const localPreferenceShares = computed({
    get: () => props.preferenceShares,
    set: (value) => emit('update:preference-shares', value)
});

const localCarveOutValue = computed({
    get: () => props.carveOutValue,
    set: (value) => emit('update:carve-out', value)
});

const isAddingNewShare = ref(false);
const newShare = reactive<PreferenceShare>({
    title: '',
    date: new Date(),
    liquidationRank: 1,
    shares: 0,
    price: 0,
    participationType: 'Non participating',
    multiple: 1,
    tri: 0
});

// Update carve out value
const updateCarveOut = () => {
    emit('update:carve-out', localCarveOutValue.value);
};

// Update a share
const updateShare = (index: number, updatedShare: PreferenceShare) => {
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

const startAddShare = () => {
    isAddingNewShare.value = true;
    Object.assign(newShare, {
        title: '',
        date: new Date(),
        liquidationRank: 1,
        shares: 0,
        price: 0,
        participationType: 'Non participating',
        multiple: 1,
        tri: 0
    });
};

const cancelAddShare = () => {
    isAddingNewShare.value = false;
};

const addShare = () => {
    // Create a new share object (to avoid reference issues)
    const shareToAdd = {
        title: newShare.title,
        date: newShare.date,
        liquidationRank: newShare.liquidationRank,
        shares: newShare.shares,
        price: newShare.price,
        participationType: newShare.participationType,
        multiple: newShare.multiple,
        tri: newShare.tri
    };

    console.log('Adding new preferred share:', shareToAdd);

    // Emit the event with the new share
    emit('add:preference-share', shareToAdd);

    // Reset the form
    isAddingNewShare.value = false;
};
</script>