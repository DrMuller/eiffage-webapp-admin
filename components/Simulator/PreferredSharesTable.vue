<template>
    <UCard variant="outline">
        <template #header>
            <span class="text-lg font-semibold mb-4">Historique - Les émissions d'actions de préférence</span>
        </template>

        <div class="body flex items-center">
            <label class="font-medium">Carve-out (%)</label>
            <UButton icon="material-symbols-light:info-outline-rounded" color="neutral" variant="ghost" class="ml-1"
                size="xs" aria-label="Info" />
            <UInput v-model="localCarveOutValue" class="w-32" @update:model-value="updateCarveOut" />
            <label class="ml-4 font-medium">Date de la cession</label>
            <UButton icon="material-symbols-light:info-outline-rounded" color="neutral" variant="ghost" class="ml-1"
                size="xs" aria-label="Info" />
            <DatePicker v-model="localEstimatedTransferDate" class="w-32"
                @update:model-value="updateEstimatedTransferDate" />
        </div>

        <UTable :data="localPreferenceShares" :columns="columns">
            <!-- Name cell template -->
            <template #name-cell="{ row }">
                <UInput v-model="row.original.name" class="w-full" required />
            </template>

            <!-- Date cell template -->
            <template #date-cell="{ row }">
                <DatePicker v-model="row.original.date" class="w-full" required />
            </template>

            <!-- Seniority cell template -->
            <template #seniority-cell="{ row }">
                <UInputNumber orientation="vertical" v-model="row.original.seniority" class="w-full" :min="1"
                    required />
            </template>

            <!-- Shares count cell template -->
            <template #nb_shares-cell="{ row }">
                <UInputNumber orientation="vertical" v-model="row.original.nb_shares" class="w-full" :min="0" required
                    @update:model-value="() => updateAmount(row.index)" />
            </template>

            <!-- Share price cell template -->
            <template #share_price-cell="{ row }">
                <UInputNumber orientation="vertical" v-model="row.original.share_price" class="w-full" :step="0.01"
                    :min="0" required @update:model-value="() => updateAmount(row.index)" />
            </template>

            <!-- Preference type cell template -->
            <template #pref_type-cell="{ row }">
                <USelect v-model="row.original.pref_type" class="w-full" :items="[{
                    label: 'Participating',
                    value: 'P'
                }, {
                    label: 'Non participating',
                    value: 'NP'
                }]" required />
            </template>

            <!-- Multiple cell template -->
            <template #pref_multiple-cell="{ row }">
                <UInputNumber orientation="vertical" v-model="row.original.pref_multiple" class="w-full" :step="0.1"
                    :min="1" required @update:model-value="() => updateAmount(row.index)" />
            </template>

            <!-- TRI cell template -->
            <template #pref_tri-cell="{ row }">
                <UInputNumber orientation="vertical" v-model="row.original.pref_tri" class="w-full" :min="0" required />
            </template>

            <!-- Actions cell template -->
            <template #actions-cell="{ row }">
                <div class="flex justify-end">
                    <UButton type="button" variant="ghost" icon="material-symbols-light:delete-outline-rounded"
                        size="md" aria-label="Delete" @click="() => deleteShare(row.index)" />
                </div>
            </template>
        </UTable>

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
import { computed, h } from 'vue';
import { resolveComponent } from 'vue';
import type { PrefShare } from '~/types/simulationRequest';
import type { TableColumn } from '@nuxt/ui';

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

// Define table columns
const columns: TableColumn<PrefShare>[] = [
    {
        accessorKey: 'name',
        header: 'Intitulé de l\'émission'
    },
    {
        accessorKey: 'date',
        header: 'Date de l\'émission'
    },
    {
        accessorKey: 'seniority',
        header: () => {
            return h('div', { class: 'flex items-center' }, [
                'Rang',
                h(resolveComponent('UButton'), {
                    icon: 'material-symbols-light:info-outline-rounded',
                    color: 'neutral',
                    variant: 'ghost',
                    class: 'ml-1',
                    size: 'xs',
                    'aria-label': 'Info'
                })
            ]);
        }
    },
    {
        accessorKey: 'nb_shares',
        header: 'Nb d\'action émises'
    },
    {
        accessorKey: 'share_price',
        header: () => {
            return h('div', { class: 'flex items-center' }, [
                'Prix de souscription',
                h(resolveComponent('UButton'), {
                    icon: 'material-symbols-light:info-outline-rounded',
                    color: 'neutral',
                    variant: 'ghost',
                    class: 'ml-1',
                    size: 'xs',
                    'aria-label': 'Info'
                })
            ]);
        }
    },
    {
        accessorKey: 'pref_type',
        header: () => {
            return h('div', { class: 'flex items-center' }, [
                'Type de participation',
                h(resolveComponent('UButton'), {
                    icon: 'material-symbols-light:info-outline-rounded',
                    color: 'neutral',
                    variant: 'ghost',
                    class: 'ml-1',
                    size: 'xs',
                    'aria-label': 'Info'
                })
            ]);
        }
    },
    {
        accessorKey: 'pref_multiple',
        header: () => {
            return h('div', { class: 'flex items-center' }, [
                'Multiple',
                h(resolveComponent('UButton'), {
                    icon: 'material-symbols-light:info-outline-rounded',
                    color: 'neutral',
                    variant: 'ghost',
                    class: 'ml-1',
                    size: 'xs',
                    'aria-label': 'Info'
                })
            ]);
        }
    },
    {
        accessorKey: 'pref_tri',
        header: () => {
            return h('div', { class: 'flex items-center' }, [
                'TRI (%)',
                h(resolveComponent('UButton'), {
                    icon: 'material-symbols-light:info-outline-rounded',
                    color: 'neutral',
                    variant: 'ghost',
                    class: 'ml-1',
                    size: 'xs',
                    'aria-label': 'Info'
                })
            ]);
        }
    },
    {
        id: 'actions',
        header: ''
    }
];

// Update carve out value
const updateCarveOut = () => {
    console.log('Carve out:', localCarveOutValue.value);
    emit('update:carve-out', localCarveOutValue.value);
};

// Update estimated transfer date
const updateEstimatedTransferDate = () => {
    console.log('Estimated transfer date:', localEstimatedTransferDate.value);
    emit('update:estimated-transfer-date', localEstimatedTransferDate.value);
};

// Function to update amount and preference-related values
const updateAmount = (index: number) => {
    const share = localPreferenceShares.value[index];
    share.amount = share.nb_shares * share.share_price;
    share.pref_share_price = share.share_price;
    share.pref_amount = share.amount * share.pref_multiple;
    share.pref_effective_multiple = share.pref_multiple;

    // Update the shares array to trigger reactivity
    const updatedShares = [...localPreferenceShares.value];
    localPreferenceShares.value = updatedShares;
};

// Delete share
const deleteShare = (index: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette émission d\'actions de préférence ?')) {
        const updatedShares = [...localPreferenceShares.value];
        updatedShares.splice(index, 1);
        localPreferenceShares.value = updatedShares;
    }
};

// Add a new empty preferred share directly to the table
const addNewShare = () => {
    const newShare: PrefShare = {
        name: '',
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