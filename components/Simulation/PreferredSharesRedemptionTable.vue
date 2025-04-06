<template>
    <div>
        <UTable :data="tableData" :columns="columns">
            <!-- Subscription price cell template -->
            <template #subscriptionPrice-cell="{ row }">
                {{ useFormatCurrency(row.original.subscriptionPrice) }}
            </template>

            <!-- Preference per share cell template -->
            <template #preferencePerShare-cell="{ row }">
                {{ useFormatCurrency(row.original.preferencePerShare) }}
            </template>

            <!-- Total preference cell template -->
            <template #totalPreference-cell="{ row }">
                {{ useFormatIntCurrency(row.original.totalPreference) }}
            </template>

            <!-- Redemption point cell template -->
            <template #redemptionPoint-cell="{ row }">
                {{ useFormatIntCurrency(row.original.redemptionPoint) }}
            </template>
        </UTable>
    </div>
</template>

<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui';
import type { Simulation } from '~/types/simulation';
import { useFormatCurrency, useFormatIntCurrency } from '~/composables/useFormatter';

// Define props for the component
const props = defineProps<{
    simulation: Simulation;
    title?: string;
    description?: string;
}>();

// Define table data interface
interface ShareRedemptionData {
    name: string;
    liquidationRank: number;
    subscriptionPrice: number;
    participationType: string;
    multiple: number;
    preferencePerShare: number;
    totalPreference: number;
    redemptionPoint: number;
}

// Generate table data from the simulation result
const tableData = computed(() => {
    // If no simulation results available or no breakpoints, return empty array
    if (!props.simulation?.results?.pref_shares_refund_breakpoints) {
        return [];
    }

    // Get the data we need from simulation results
    const { pref_shares_refund_breakpoints } = props.simulation.results;
    const { pref_shares } = props.simulation.request;

    const processedData: ShareRedemptionData[] = [];

    // Convert the pref shares from the request into our table data format
    Object.keys(pref_shares_refund_breakpoints)
        .filter(key => key !== 'all_shares_at_prorata') // Exclude non-share keys
        .forEach(key => {
            // Find the corresponding preferred share in the request data
            const prefShare = pref_shares?.find(share => share.name === key);

            if (prefShare) {
                // Add the formatted table row
                processedData.push({
                    name: prefShare.name,
                    liquidationRank: prefShare.seniority,
                    subscriptionPrice: prefShare.share_price,
                    participationType: prefShare.pref_type === 'P' ? 'Participating' : 'Non participating',
                    multiple: prefShare.pref_multiple,
                    preferencePerShare: prefShare.pref_share_price,
                    totalPreference: prefShare.pref_amount,
                    redemptionPoint: pref_shares_refund_breakpoints[key]
                });
            }
        });

    // Sort by liquidation rank
    processedData.sort((a, b) => a.liquidationRank - b.liquidationRank);

    return processedData;
});

// Define table columns
const columns = computed<TableColumn<ShareRedemptionData>[]>(() => [
    {
        accessorKey: 'name',
        header: '',
    },
    {
        accessorKey: 'liquidationRank',
        header: 'Rang de liquidation',
    },
    {
        accessorKey: 'subscriptionPrice',
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
        accessorKey: 'participationType',
        header: 'Type de participation',
    },
    {
        accessorKey: 'multiple',
        header: 'Multiple',
    },
    {
        accessorKey: 'preferencePerShare',
        header: 'Préférence par action',
    },
    {
        accessorKey: 'totalPreference',
        header: 'Préférence totale',
    },
    {
        accessorKey: 'redemptionPoint',
        header: 'Point de remboursement (VT)',
    },
]);

</script>