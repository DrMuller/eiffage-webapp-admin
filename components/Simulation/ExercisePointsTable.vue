<template>
    <div>
        <UTable :data="tableData" :columns="columns">
            <!-- Exercise Price cell template -->
            <template #exercisePrice-cell="{ row }">
                {{ row.original.exercisePrice }}
            </template>

            <!-- Exercisable Options cell template -->
            <template #exercisableOptions-cell="{ row }">
                {{ row.original.exercisableOptions }}
            </template>

            <!-- Exercise Point cell template -->
            <template #exercisePoint-cell="{ row }">
                {{ row.original.exercisePoint }}
            </template>
        </UTable>
    </div>
</template>

<script setup lang="ts">
import { computed, h } from 'vue';
import { resolveComponent } from 'vue';
import type { TableColumn } from '@nuxt/ui';
import type { Simulation } from '~/types/simulation';

// Define the row data type
interface OptionTableRow {
    optionType: string;
    exercisePrice: string;
    exercisableOptions: string;
    exercisePoint: string;
}

// Define props for the component
const props = defineProps<{
    simulation: Simulation;
}>();

// Define table columns
const columns = computed<TableColumn<OptionTableRow>[]>(() => [
    {
        accessorKey: 'optionType',
        header: '',
    },
    {
        accessorKey: 'exercisePrice',
        header: 'Prix d\'exercice',
    },
    {
        accessorKey: 'exercisableOptions',
        header: 'Nombre d\'options exerçables',
    },
    {
        accessorKey: 'exercisePoint',
        header: 'Point d\'exercice (VT)',
    }
]);

// Generate table data from the simulation data
const tableData = computed(() => {
    if (!props.simulation?.results?.options_exercise_points || !props.simulation?.request?.options) {
        return [];
    }

    // Get options data from the simulation request
    const { options } = props.simulation.request;

    // Get exercise points from the simulation results
    const { options_exercise_points } = props.simulation.results;

    // Map each option to a row in the table
    return options.map(option => {
        // Calculate number of exercisable options (total - dead)
        const exercisableOptions = option.nb_options - (option.nb_dead_options || 0);

        return {
            optionType: option.name,
            exercisePrice: formatCurrency(option.strike),
            exercisableOptions: exercisableOptions.toLocaleString('fr-FR'),
            exercisePoint: formatCurrency(options_exercise_points[option.name] || 0)
        };
    });
});

// Format a number as currency (EUR)
const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
        style: 'decimal',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value) + ' €';
};
</script>