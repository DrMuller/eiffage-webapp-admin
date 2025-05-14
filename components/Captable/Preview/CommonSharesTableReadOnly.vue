<template>
    <div class="m-8 text-center">
        <h3> Actions ordinaires</h3>
        <span>
            Le tableau ci-dessous présente l'ensemble des actions ordinaires non identifiées par un label, correspondant
            aux
            actions émises lors de la création de la société ainsi qu'à celles émises lors des augmentations de capital
            ultérieures.
        </span>
    </div>
    <UCard variant="outline">
        <template #header>
            <span class="text-lg font-semibold mb-4">Historique - Émissions d'actions ordinaires</span>
        </template>

        <UTable :data="commonShares" :columns="columns">
            <!-- Amount cell template -->
            <template #amount-cell="{ row }">
                {{ formatCurrency(row.original.amount) }}
            </template>

            <!-- Date cell template -->
            <template #date-cell="{ row }">
                {{ formatDate(row.original.date) }}
            </template>

            <!-- Number of shares cell template -->
            <template #nb_shares-cell="{ row }">
                {{ formatNumber(row.original.nb_shares) }}
            </template>

            <!-- Share price cell template -->
            <template #share_price-cell="{ row }">
                {{ formatCurrency(row.original.share_price) }}
            </template>
        </UTable>
    </UCard>
</template>

<script setup lang="ts">
import type { CommonShareRequest } from '~/types/captable';
import type { TableColumn } from '@nuxt/ui';
import { useI18n } from 'vue-i18n';

// Define component props
const { commonShares } = defineProps<{
    commonShares: CommonShareRequest[];
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
const columns: TableColumn<CommonShareRequest>[] = [
    {
        accessorKey: 'name',
        header: 'Intitulé de l\'émission',
    },
    {
        accessorKey: 'date',
        header: 'Date de l\'émission',
    },
    {
        accessorKey: 'nb_shares',
        header: 'Nombre d\'action émises',
    },
    {
        accessorKey: 'share_price',
        header: 'Prix de souscription d\'une action(€)',
    },
    {
        accessorKey: 'amount',
        header: 'Montant total',
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