<template>
    <div>
        <UTable :data="transformedData" :columns="columns">
            <!-- Dynamic cell template for each column -->
            <template v-for="exitValue in props.simulation?.results?.result_at_breakpoints?.exit_values || []"
                :key="exitValue" #[`breakpoint-${exitValue}-cell`]="{ row }">
                <span :class="getCellClass(row.original.name, exitValue)">
                    {{ useFormatCurrency(getCellValue(row.original.name, exitValue)) }}
                </span>
            </template>
        </UTable>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { TableColumn } from '@nuxt/ui';
import type { Simulation } from '~/types/simulation';
import { useFormatCurrency } from '~/composables/useFormatter';

// Define interfaces for transformed data structure
interface CellData {
    value: number;
    isPositive: boolean;
}

interface ShareData {
    name: string;
    values: Record<number, CellData>;
}

// Define props for the component
const props = defineProps<{
    simulation: Simulation;
}>();

// Transform simulation data to the new format
const transformedData = computed<ShareData[]>(() => {
    if (!props.simulation?.results?.result_at_breakpoints ||
        !props.simulation?.results?.pref_shares_refund_breakpoints) {
        return [];
    }

    const { pref_shares } = props.simulation.request;
    const resultAtBreakpoints = props.simulation.results.result_at_breakpoints;

    // Ensure all required data is available
    if (!resultAtBreakpoints.share_price || !resultAtBreakpoints.exit_values) {
        return [];
    }

    const preSharesAtBreakpoints = resultAtBreakpoints.share_price.pref_shares;
    const commonSharesAtBreakpoints = resultAtBreakpoints.share_price.common_shares;

    const result: ShareData[] = [];

    // Process common shares - still a single entry in this data structure
    if (commonSharesAtBreakpoints) {
        const commonShareData: ShareData = {
            name: 'Actions ordinaires',
            values: {}
        };

        resultAtBreakpoints.exit_values.forEach((exitValue, index) => {
            const value = commonSharesAtBreakpoints[index] || 0;
            const isProrata = props.simulation.results.result_at_breakpoints?.more.all_shares_at_prorata[index] ?? false;
            commonShareData.values[exitValue] = {
                value,
                isPositive: isProrata
            };
        });

        result.push(commonShareData);
    }

    // Process preference shares
    pref_shares.forEach(prefShare => {
        const shareData: ShareData = {
            name: prefShare.name,
            values: {}
        };

        resultAtBreakpoints.exit_values.forEach((exitValue, index) => {
            const value = preSharesAtBreakpoints[prefShare.name]?.[index] || 0;
            shareData.values[exitValue] = {
                value,
                isPositive: value > prefShare.share_price
            };
        });

        result.push(shareData);
    });

    return result.reverse();
});

// Helper functions to access the transformed data
const getCellValue = (shareName: string, exitValue: number): number => {
    const share = transformedData.value.find(s => s.name === shareName);
    return share?.values[exitValue]?.value || 0;
};

const getCellClass = (shareName: string, exitValue: number): string => {
    const share = transformedData.value.find(s => s.name === shareName);
    return share?.values[exitValue]?.isPositive ? 'text-green-500' : 'text-red-500';
};

// Define table columns based on breakpoints
const columns = computed<TableColumn<ShareData>[]>(() => {
    if (!props.simulation?.results?.result_at_breakpoints?.exit_values) {
        return [];
    }

    const exitValues = props.simulation.results.result_at_breakpoints.exit_values;

    // First column is static - the share name
    const cols: TableColumn<ShareData>[] = [
        {
            accessorKey: 'name',
            header: '',
        }
    ];

    // Add a column for each exit value
    exitValues.forEach(exitValue => {
        cols.push({
            accessorKey: `breakpoint-${exitValue}`,
            header: `VT = ${useFormatIntCurrency(exitValue)}`,
        });
    });

    return cols;
});
</script>