<template>
    <div class="m-8 text-center">
        <h3>Options</h3>
        <span>Ce tableau indique le nombre d'options émises par la société. Celles-ci sont supposées systématiquement
            être exercées dès lors que le prix par action de la cession dépasse leur prix d'exercice.
            Ainsi, seules les actions générant un gain financier au moment de la cession sont identifiées comme faisant
            partie du capital.</span>
    </div>
    <UCard variant="outline">
        <template #header>
            <span class="text-lg font-semibold mb-4">Historique - Émissions d'options (BSPCE, BSA)</span>
        </template>

        <UTable :data="options" :columns="columns">
            <!-- Date cell template -->
            <template #date-cell="{ row }">
                {{ formatDate(row.original.date) }}
            </template>

            <!-- Number of options cell template -->
            <template #nb_options-cell="{ row }">
                {{ formatNumber(row.original.nb_options) }}
            </template>

            <!-- Strike price cell template -->
            <template #strike-cell="{ row }">
                {{ formatCurrency(row.original.strike) }}
            </template>

            <!-- Dead options cell template -->
            <template #nb_dead_options-cell="{ row }">
                {{ formatNumber(row.original.nb_dead_options) }}
            </template>
        </UTable>
    </UCard>
</template>

<script setup lang="ts">
import { h, resolveComponent } from 'vue';
import type { OptionRequest } from '~/types/captable';
import type { TableColumn } from '@nuxt/ui';
import { useI18n } from 'vue-i18n';

// Define component props
const { options } = defineProps<{
    options: OptionRequest[];
}>();

// Get current locale for formatting
const { locale } = useI18n();

// Helper function to format currency
const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(locale.value, {
        style: 'currency',
        currency: 'EUR'
    }).format(value);
};

// Helper function to format number
const formatNumber = (value: number) => {
    return new Intl.NumberFormat(locale.value).format(value);
};

// Helper function to format date
const formatDate = (date: Date) => {
    return date.toLocaleDateString(locale.value);
};

// Define table columns for read-only view
const columns: TableColumn<OptionRequest>[] = [
    {
        accessorKey: 'name',
        header: 'Intitulé du plan d\'options',
    },
    {
        accessorKey: 'date',
        header: 'Date du plan',
    },
    {
        accessorKey: 'nb_options',
        header: () => {
            return h('div', { class: 'flex items-center' }, [
                'Nombre d\'options émises',
                h(resolveComponent('UTooltip'), {
                    arrow: true,
                    text: "Par hypothèse une option (BSPCE ou BSA) est un bon qui donne le droit de souscrire une action ordinaire."
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
        accessorKey: 'strike',
        header: 'Prix d\'exercice (€)',
    },
    {
        accessorKey: 'nb_dead_options',
        header: 'Nombre d\'options caduques à ce jour',
    }
];
</script>


<style scoped>
h3 {
    margin-bottom: 1rem;
    font-size: 1.2rem;
    font-weight: 600;
}
</style>