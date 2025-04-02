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
                <UInputNumber orientation="vertical" v-model="row.original.nb_options" class="w-full" :min="0"
                    required />
            </template>

            <!-- Strike price cell template -->
            <template #strike-cell="{ row }">
                <UInputNumber orientation="vertical" v-model="row.original.strike" class="w-full" :step="0.01" :min="0"
                    required />
            </template>

            <!-- Dead options cell template -->
            <template #nb_dead_options-cell="{ row }">
                <UInputNumber orientation="vertical" v-model="row.original.nb_dead_options" class="w-full" :min="0"
                    required />
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
import { computed, h } from 'vue';
import { resolveComponent } from 'vue';
import type { Option } from '~/types/simulationRequest';
import type { TableColumn } from '@nuxt/ui';

// Define component props
const props = defineProps<{
    options: Option[];
}>();

// Define emits
const emit = defineEmits<{
    'update:options': [options: Option[]];
}>();

// Create local reactive copy of props
const localOptions = computed({
    get: () => props.options,
    set: (value) => emit('update:options', value)
});

// Define table columns
const columns: TableColumn<Option>[] = [
    {
        accessorKey: 'name',
        header: () => {
            return h('div', { class: 'flex items-center' }, [
                'Intitulé du plan d\'options',
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
                'Date du plan',
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
        accessorKey: 'nb_options',
        header: () => {
            return h('div', { class: 'flex items-center' }, [
                'Nombre d\'options émises',
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
        accessorKey: 'strike',
        header: () => {
            return h('div', { class: 'flex items-center' }, [
                'Prix d\'exercice',
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
        accessorKey: 'nb_dead_options',
        header: () => {
            return h('div', { class: 'flex items-center' }, [
                'Nombre d\'options caduques à ce jour',
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
