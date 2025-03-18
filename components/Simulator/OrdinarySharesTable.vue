<template>
    <UCard variant="outline">
        <template #header>
            <span class="text-lg font-semibold mb-4">Historique - Les émissions d'actions ordinaires non
                labellisées</span>
        </template>

        <div class="flex items-center body">
            <label class="mr-4 font-medium">Valeur nominale par action</label>
            <UInput class="w-32" placeholder="18 200" />
            <UButton icon="i-heroicons-information-circle" color="neutral" variant="ghost" class="ml-1" size="xs"
                aria-label="Info" />
        </div>

        <UTable sticky :columns="columns" :data="localOrdinaryShares" class="w-full" hover>
            <template #name-cell="{ row }">
                <UInput v-if="editingRow === row.index" v-model="editingShare.name" class="w-full" />
                <span v-else>{{ row.original.name }}</span>
            </template>
            <template #date-cell="{ row }">
                <DatePicker v-if="editingRow === row.index" v-model="editingShare.date" class="w-full" />
                <span v-else>{{ row.original.date.toLocaleDateString('fr-FR') }}</span>
            </template>
            <template #nb_shares-cell="{ row }">
                <UInput v-if="editingRow === row.index" v-model.number="editingShare.nb_shares" class="w-full"
                    type="number" @update:model-value="updateAmount" />
                <span v-else>{{ row.original.nb_shares }}</span>
            </template>
            <template #share_price-cell="{ row }">
                <UInput v-if="editingRow === row.index" v-model.number="editingShare.share_price" class="w-full"
                    type="number" step="0.01" @update:model-value="updateAmount" />
                <span v-else>{{ row.original.share_price.toFixed(2) }} €</span>
            </template>
            <template #actions-cell="{ row }">
                <div v-if="editingRow === row.index" class="flex gap-2">
                    <UButton color="success" variant="ghost" icon="i-heroicons-check" size="sm" aria-label="Save"
                        @click="saveShare()" />
                    <UButton color="neutral" variant="ghost" icon="i-heroicons-x-mark" size="sm" aria-label="Cancel"
                        @click="cancelEdit()" />
                </div>
                <div v-else class="flex justify-end">
                    <UButton color="neutral" variant="ghost" icon="i-heroicons-pencil-square" size="sm"
                        aria-label="Edit" @click="editShare(row.index)" />
                </div>
            </template>
            <template #header-cell="{ column }">
                <div class="flex items-center">
                    {{ column.id ? (column.id === 'actions' ? '' : column.id) : '' }}
                    <UButton v-if="column.id && column.id !== 'actions'" icon="i-heroicons-information-circle"
                        color="neutral" variant="ghost" class="ml-1" size="xs" aria-label="Info" />
                </div>
            </template>
        </UTable>

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
import type { TableColumn } from '@nuxt/ui';

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

const columns: TableColumn<OrdinaryShares>[] = [
    {
        accessorKey: 'name',
        header: 'Intitulé de l\'émission'
    },
    {
        accessorKey: 'date',
        header: 'Date de l\'émission'
    },
    {
        accessorKey: 'nb_shares',
        header: 'Nombre d\'action émises'
    },
    {
        accessorKey: 'share_price',
        header: 'Prix de souscription'
    },
    {
        id: 'actions',
        header: ''
    }
];

const editingRow = ref<number | null>(null);
const editingShare = ref<OrdinaryShares>({
    name: '',
    date: new Date(),
    nb_shares: 0,
    share_price: 0,
    amount: 0
});

const isAddingNewShare = ref(false);
const newShare = reactive<OrdinaryShares>({
    name: '',
    date: new Date(),
    nb_shares: 0,
    share_price: 0,
    amount: 0
});

// Prefixed with underscore to indicate it's not used in the current UI
const _deleteShare = (index: number) => {
    const updatedShares = [...localOrdinaryShares.value];
    updatedShares.splice(index, 1);
    localOrdinaryShares.value = updatedShares;
};

const editShare = (index: number) => {
    editingRow.value = index;
    editingShare.value = { ...localOrdinaryShares.value[index] };
};

const saveShare = () => {
    if (editingRow.value !== null) {
        const updatedShares = [...localOrdinaryShares.value];
        updatedShares[editingRow.value] = { ...editingShare.value };
        localOrdinaryShares.value = updatedShares;
        editingRow.value = null;
    }
};

const cancelEdit = () => {
    editingRow.value = null;
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

// Calculate amount when shares or price change
const updateAmount = () => {
    if (editingRow.value !== null) {
        editingShare.value.amount = editingShare.value.nb_shares * editingShare.value.share_price;
    }
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
