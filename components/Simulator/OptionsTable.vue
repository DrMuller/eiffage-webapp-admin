<template>
    <UCard variant="outline">
        <template #header>
            <span class="text-lg font-semibold mb-4">Historique - Les émissions d'options (BSPCE, BSA)</span>
        </template>

        <UTable :data="localOptions" :columns="columns">
            <!-- Name cell template -->
            <template #name-cell="{ row }">
                <UInput v-model="row.original.name" class="w-full" required />
            </template>

            <!-- Date cell template -->
            <template #date-cell="{ row }">
                <DatePicker v-model="row.original.date" class="w-full" required />
            </template>

            <!-- Number of options cell template -->
            <template #nb_options-cell="{ row }">
                <UInputNumber v-model="row.original.nb_options" orientation="vertical" class="w-full" :min="0" required
                    :locale="locale" />
            </template>

            <!-- Strike price cell template -->
            <template #strike-cell="{ row }">
                <UInputNumber v-model="row.original.strike" orientation="vertical" class="w-full" :step="0.01" :min="0"
                    required :locale="locale" />
            </template>

            <!-- Dead options cell template -->
            <template #nb_dead_options-cell="{ row }">
                <UInputNumber v-model="row.original.nb_dead_options" orientation="vertical" class="w-full" :min="0"
                    required :locale="locale" />
            </template>

            <!-- Actions cell template -->
            <template #actions-cell="{ row }">
                <div class="flex justify-end">
                    <UButton type="button" variant="ghost" icon="material-symbols-light:delete-outline-rounded"
                        size="md" aria-label="Delete" @click="() => deleteOption(row.index)" />
                </div>
            </template>
        </UTable>

        <template #footer>
            <div>
                <UButton variant="ghost" icon="i-heroicons-plus" class="text-sm" @click="addNewOption">
                    Ajouter un plan d'options
                </UButton>
            </div>
        </template>
    </UCard>
</template>

<script setup lang="ts">
import { computed, h, resolveComponent } from 'vue';
import type { Option } from '~/types/simulationRequest';
import type { TableColumn } from '@nuxt/ui';
import { useI18n } from 'vue-i18n';

// Define component props
const props = defineProps<{
    options: Option[];
}>();

// Define emits
const emit = defineEmits<{
    'update:options': [options: Option[]];
}>();

// Get current locale
const { locale } = useI18n();

// Create local reactive copy of props
const localOptions = computed({
    get: () => props.options,
    set: (value) => emit('update:options', value)
});

// Define table columns
const columns: TableColumn<Option>[] = [
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
                'Intitulé du plan d\'options',
                h(resolveComponent('UTooltip'), {
                    arrow: true,
                    text: "Par hypothèse une option (BSPCE ou BSA) est un bon qui donne le droit de souscrire une action ordinaire."
                }, () => [
                    h(resolveComponent('UButton'), {
                        icon: 'material-symbols-light:help',
                        // color: 'black',
                        variant: 'ghost',
                        class: 'ml-1',
                        size: 'xs',
                        // 'aria-label': 'Info'
                    })
                ])
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
                'Date du plan'
            ]);
        }
    },
    {
        accessorKey: 'nb_options',
        header: () => {
            return h('div', { class: 'flex items-center' }, [
                'Nombre d\'options émises',
            ]);
        }
    },
    {
        accessorKey: 'strike',
        header: () => {
            return h('div', { class: 'flex items-center' }, [
                'Prix d\'exercice',

            ]);
        }
    },
    {
        accessorKey: 'nb_dead_options',
        header: () => {
            return h('div', { class: 'flex items-center' }, [
                'Nombre d\'options caduques à ce jour'
            ]);
        }
    },
    {
        id: 'actions',
        header: ''
    }
];

// Delete option
const deleteOption = (index: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce plan d\'options ?')) {
        const updatedOptions = [...localOptions.value];
        updatedOptions.splice(index, 1);
        localOptions.value = updatedOptions;
    }
};

// Add a new empty option directly to the table
const addNewOption = () => {
    const newOption = {
        name: 'Nouveau plan',
        date: new Date(),
        nb_options: 0,
        strike: 0,
        nb_dead_options: 0,
    };

    // Add the new option to the local array
    const updatedOptions = [...localOptions.value, newOption];
    localOptions.value = updatedOptions;
};
</script>
