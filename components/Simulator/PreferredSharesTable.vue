<template>
    <UCard variant="outline">
        <template #header>
            <span class="text-lg font-semibold mb-4">Historique - Les émissions d'actions de préférence</span>
        </template>

        <div class="body flex items-center">
            <label class="mr-4 font-medium">Carve-out distribué avant application des préférences (%)</label>
            <UInput v-model="localCarveOutValue" class="w-32" @update:model-value="updateCarveOut" />
            <UButton icon="i-heroicons-information-circle" color="neutral" variant="ghost" class="ml-1" size="xs"
                aria-label="Info" />
        </div>
        <UTable :columns="columns" :data="localPreferenceShares" class="w-full" hover>
            <template #title-cell="{ row }">
                <UInput v-if="editingRow === row.index" v-model="editingShare.title" class="w-full" />
                <span v-else>{{ row.original.title }}</span>
            </template>
            <template #date-cell="{ row }">
                <DatePicker v-if="editingRow === row.index" v-model="editingShare.date" class="w-full" />
                <span v-else>{{ row.original.date.toLocaleDateString('fr-FR') }}</span>
            </template>
            <template #liquidationRank-cell="{ row }">
                <UInput v-if="editingRow === row.index" v-model.number="editingShare.liquidationRank" class="w-full"
                    type="number" min="1" />
                <span v-else>{{ row.original.liquidationRank }}</span>
            </template>
            <template #shares-cell="{ row }">
                <UInput v-if="editingRow === row.index" v-model.number="editingShare.shares" class="w-full"
                    type="number" />
                <span v-else>{{ row.original.shares }}</span>
            </template>
            <template #price-cell="{ row }">
                <UInput v-if="editingRow === row.index" v-model.number="editingShare.price" class="w-full" type="number"
                    step="0.01" />
                <span v-else>{{ row.original.price.toFixed(2) }} €</span>
            </template>
            <template #participationType-cell="{ row }">
                <USelect v-if="editingRow === row.index" v-model="editingShare.participationType" class="w-full"
                    :options="['Participating', 'Non participating']" />
                <span v-else>{{ row.original.participationType }}</span>
            </template>
            <template #multiple-cell="{ row }">
                <UInput v-if="editingRow === row.index" v-model.number="editingShare.multiple" class="w-full"
                    type="number" step="0.1" min="1" />
                <span v-else>{{ row.original.multiple }}</span>
            </template>
            <template #tri-cell="{ row }">
                <UInput v-if="editingRow === row.index" v-model.number="editingShare.tri" class="w-full"
                    type="number" />
                <span v-else>{{ row.original.tri }} %</span>
            </template>
            <template #actions-cell="{ row }">
                <div v-if="editingRow === row.index" class="flex justify-end">
                    <UButton color="success" variant="ghost" icon="material-symbols-light:check-rounded" size="sm"
                        aria-label="Save" @click="saveShare()" />
                    <UButton color="neutral" variant="ghost" icon="material-symbols-light:close-rounded" size="sm"
                        aria-label="Cancel" @click="cancelEdit()" />
                </div>
                <div v-else class="flex justify-end">
                    <UButton color="neutral" variant="ghost" icon="material-symbols-light:edit-square-outline-rounded"
                        size="sm" aria-label="Edit" @click="editShare(row.index)" />
                    <UButton color="error" variant="ghost" icon="material-symbols-light:delete-outline-rounded"
                        size="sm" aria-label="Delete" @click="deleteShare(row.index)" />
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
                            <label class="block text-sm mb-1">Rang de liquidation</label>
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
import type { TableColumn } from '@nuxt/ui';

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

const columns: TableColumn<PreferenceShare>[] = [
    {
        accessorKey: 'title',
        header: 'Intitulé de l\'émission'
    },
    {
        accessorKey: 'date',
        header: 'Date de l\'émission'
    },
    {
        accessorKey: 'liquidationRank',
        header: 'Rang de liquidation'
    },
    {
        accessorKey: 'shares',
        header: 'Nombre d\'action émises'
    },
    {
        accessorKey: 'price',
        header: 'Prix de souscription'
    },
    {
        accessorKey: 'participationType',
        header: 'Type de participation'
    },
    {
        accessorKey: 'multiple',
        header: 'Multiple'
    },
    {
        accessorKey: 'tri',
        header: 'TRI (%)'
    },
    {
        id: 'actions',
        header: ''
    }
];

const editingRow = ref<number | null>(null);
const editingShare = ref<PreferenceShare>({
    title: '',
    date: new Date(),
    liquidationRank: 1,
    shares: 0,
    price: 0,
    participationType: 'Non participating',
    multiple: 1,
    tri: 0
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

// Prefixed with underscore to indicate it's not used in the current UI
// but could be useful for future functionality
const _deleteShare = (index: number) => {
    const updatedShares = [...localPreferenceShares.value];
    updatedShares.splice(index, 1);
    localPreferenceShares.value = updatedShares;
};

const editShare = (index: number) => {
    editingRow.value = index;
    editingShare.value = { ...localPreferenceShares.value[index] };
};

const saveShare = () => {
    if (editingRow.value !== null) {
        const updatedShares = [...localPreferenceShares.value];
        updatedShares[editingRow.value] = { ...editingShare.value };
        localPreferenceShares.value = updatedShares;
        editingRow.value = null;
    }
};

const cancelEdit = () => {
    editingRow.value = null;
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
        date: new Date(newShare.date),
        liquidationRank: newShare.liquidationRank,
        shares: newShare.shares,
        price: newShare.price,
        participationType: newShare.participationType,
        multiple: newShare.multiple,
        tri: newShare.tri
    };

    console.log('Adding new preference share:', shareToAdd);

    // Emit the event with the new share
    emit('add:preference-share', shareToAdd);

    // Reset the form
    isAddingNewShare.value = false;
};
</script>