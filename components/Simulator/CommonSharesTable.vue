<template>
    <UCard variant="outline">
        <template #header>
            <span class="text-lg font-semibold mb-4">Historique - Les émissions d'actions ordinaires non
                labellisées</span>
        </template>

        <UTable :data="localCommonShares" :columns="columns">
            <!-- Name cell template -->
            <template #name-cell="{ row }">
                <UInput v-model="row.original.name" class="w-full" required />
            </template>

            <!-- Date cell template -->
            <template #date-cell="{ row }">
                <DatePicker v-model="row.original.date" class="w-full" required />
            </template>

            <!-- Number of shares cell template -->
            <template #nb_shares-cell="{ row }">
                <UInputNumber orientation="vertical" v-model="row.original.nb_shares" class="w-full" :min="0" required
                    @update:model-value="() => updateAmount(row.index)" />
            </template>

            <!-- Share price cell template -->
            <template #share_price-cell="{ row }">
                <UInputNumber orientation="vertical" v-model="row.original.share_price" class="w-full" :step="0.01"
                    :min="0" required @update:model-value="() => updateAmount(row.index)" />
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
                    Ajouter une émission d'actions
                </UButton>
            </div>
        </template>
    </UCard>
</template>

<script setup lang="ts">
import { computed, h } from 'vue';
import { resolveComponent } from 'vue';
import type { CommonShare } from '~/types/simulationRequest';
import type { TableColumn } from '@nuxt/ui';

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

// Define table columns
const columns: TableColumn<CommonShare>[] = [
    {
        accessorKey: 'name',
        header: () => {
            return h('div', { class: 'flex items-center' }, [
                'Intitulé de l\'émission',
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
        accessorKey: 'date',
        header: () => {
            return h('div', { class: 'flex items-center' }, [
                'Date de l\'émission',
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
        header: () => {
            return h('div', { class: 'flex items-center' }, [
                'Nombre d\'action émises',
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
        id: 'actions',
        header: ''
    }
];

// Function to update amount
const updateAmount = (index: number) => {
    const share = localCommonShares.value[index];
    share.amount = share.nb_shares * share.share_price;

    // Update the shares array to trigger reactivity
    const updatedShares = [...localCommonShares.value];
    localCommonShares.value = updatedShares;
};

// Delete share with confirmation dialog
const deleteShare = (index: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette émission d\'actions ?')) {
        const updatedShares = [...localCommonShares.value];
        updatedShares.splice(index, 1);
        localCommonShares.value = updatedShares;
    }
};

// Add a new empty share directly to the table
const addNewShare = () => {
    const newShare = {
        name: '',
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
