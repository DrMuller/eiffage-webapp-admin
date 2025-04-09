<template>
    <UCard variant="outline">
        <template #header>
            <span class="text-lg font-semibold mb-4">Historique - Émissions d'actions ordinaires</span>
        </template>

        <UTable :data="localCommonShares" :columns="columns" column-sizing-state="{ columnSizing: { 'name': 100 } }">
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
                <UInputNumber v-model="row.original.nb_shares" orientation="vertical" class="w-full" :min="0" required
                    :locale="locale" @update:model-value="() => updateAmount(row.index)" />
            </template>

            <!-- Share price cell template -->
            <template #share_price-cell="{ row }">
                <UInputNumber v-model="row.original.share_price" orientation="vertical" class="w-full" :step="0.01"
                    :min="0" required :locale="locale" @update:model-value="() => updateAmount(row.index)" />
            </template>

            <!-- Actions cell template -->
            <template #actions-cell="{ row }">
                <div class="flex justify-end">
                    <UButton type="button" color="error" icon="material-symbols-light:delete-outline-rounded" size="md"
                        aria-label="Delete" @click="() => deleteShare(row.index)" />
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
import { computed, h, resolveComponent } from 'vue';
import type { CommonShare } from '~/types/simulationRequest';
import type { TableColumn } from '@nuxt/ui';
import { useI18n } from 'vue-i18n';

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

// Get current locale
const { locale } = useI18n();
// Define table columns
const columns: TableColumn<CommonShare>[] = [
    {
        accessorKey: 'name',
        meta: {
            class: {
                td: 'w-[290px]',
                th: 'w-[290px]'
            }
        },
        header: () => {
            return h('div', { class: 'flex items-center' }, [
                'Intitulé de l\'émission',
            ]);
        }
    },
    {
        accessorKey: 'date',
        meta: {
            class: {
                td: 'w-[180px]',
                th: 'w-[180px]'
            }
        },
        header: () => {
            return h('div', { class: 'flex items-center' }, [
                'Date de l\'émission',
            ]);
        }
    },
    {
        accessorKey: 'nb_shares',
        header: () => {
            return h('div', { class: 'flex items-center' }, [
                'Nombre d\'action émises',
            ]);
        }
    },
    {
        accessorKey: 'share_price',
        header: () => {
            return h('div', { class: 'flex items-center' }, [
                'Prix de souscription d\'une action(€)',
                h(resolveComponent('UTooltip'), {
                    arrow: true,
                    text: "Prix payé pour souscrire à une action. Ce prix est constitué de la valeur nominale de l'action auquel il peut être ajouté une prime d'émission qui permet de tenir compte de la valeur réelle de l'entreprise."
                }, () => [
                    h(resolveComponent('UButton'), {
                        icon: 'material-symbols-light:help',
                        variant: 'ghost',
                        class: 'ml-1 text-gray-600',
                        size: 'xs',
                    })
                ])
            ]);
        }
    },
    {
        id: 'actions',
        header: '',
        meta: {
            class: {
                td: 'w-[54px]',
                th: 'w-[54px]'
            }
        }
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
