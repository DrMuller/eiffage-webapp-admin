<template>
    <div>
        <UTable :data="transformedData" :columns="columns">
            <!-- Percentage cell template -->
            <template #percentageCapital-cell="{ row }">
                {{ row.original.percentageCapital }}
            </template>

            <!-- Dynamic cell templates for each breakpoint -->
            <template v-for="exitValue in props.simulation?.results?.result_at_breakpoints?.exit_values || []"
                :key="exitValue" #[`breakpoint-${exitValue}-cell`]="{ row }">
                <div>
                    <div :class="getCellClass(row.original.name, exitValue)">
                        {{ useFormatIntCurrency(getCellValue(row.original.name, exitValue)) }}
                    </div>
                    <div class="text-gray-500 text-sm">
                        {{ getPercentage(row.original.name, exitValue) }}
                    </div>
                </div>
            </template>
        </UTable>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { TableColumn } from '@nuxt/ui';
import type { Simulation } from '~/types/simulation';
import { useFormatIntCurrency } from '~/composables/useFormatter';

// Define interfaces for transformed data structure
interface CellData {
    value: number;
    percentage: number;
    isHighlighted: boolean;
}

interface ShareData {
    name: string;
    percentageCapital: string;
    percentageCapitalValue: number;
    values: Record<number, CellData>;
}

// Define props for the component
const props = defineProps<{
    simulation: Simulation;
}>();

const isHighlightedValue = (shareName: string, value: number, exitValueIndex?: number) => {
    if (shareName === 'Actions ordinaires' && exitValueIndex !== undefined) {
        return props.simulation.results.result_at_breakpoints?.more.all_shares_at_prorata[exitValueIndex] ?? false;
    }
    const prefShare = props.simulation.request.pref_shares.find(share => share.name === shareName);
    if (prefShare) {
        return Math.round(value) >= Math.round(prefShare.pref_amount);
    }

    return false;
};

// Get percentage of fully diluted shares
const getSharePercentage = (shareName: string) => {
    if (shareName === 'Actions ordinaires') {
        const totalShares = props.simulation.results.more.total_nb_shares_fd;
        const commonShares = props.simulation.results.more.nb_common_shares_fd;
        return (commonShares / totalShares) * 100;
    }

    // For preferred shares
    const { pref_shares } = props.simulation.request;
    const totalShares = props.simulation.results.more.total_nb_shares_fd;

    const prefShare = pref_shares.find(share => share.name === shareName);
    if (prefShare) {
        return (prefShare.nb_shares / totalShares) * 100;
    }

    return 0;
};

// Transform simulation data to the new format
const transformedData = computed<ShareData[]>(() => {
    if (!props.simulation?.results?.result_at_breakpoints ||
        !props.simulation?.results?.pref_shares_refund_breakpoints) {
        return [];
    }

    const { pref_shares } = props.simulation.request;
    const resultAtBreakpoints = props.simulation.results.result_at_breakpoints;

    // Ensure all required data is available
    if (!resultAtBreakpoints.proceeds || !resultAtBreakpoints.exit_values) {
        return [];
    }

    const prefSharesProceeds = resultAtBreakpoints.proceeds.pref_shares;
    const commonSharesProceeds = resultAtBreakpoints.proceeds.common_shares;

    const result: ShareData[] = [];

    // Process common shares
    if (commonSharesProceeds) {
        const commonPercentCapital = getSharePercentage('Actions ordinaires');
        const commonShareData: ShareData = {
            name: 'Actions ordinaires',
            percentageCapital: `${commonPercentCapital.toFixed(1)}%`,
            percentageCapitalValue: commonPercentCapital,
            values: {}
        };

        resultAtBreakpoints.exit_values.forEach((exitValue, index) => {
            const value = commonSharesProceeds[index] || 0;
            const totalExitValue = exitValue + (resultAtBreakpoints.more.options_exercise_proceeds[index] || 0);
            const percentage = totalExitValue > 0 ? (value / totalExitValue) * 100 : 0;
            const isHighlighted = isHighlightedValue('Actions ordinaires', value, index);

            commonShareData.values[exitValue] = {
                value,
                percentage,
                isHighlighted
            };
        });

        result.push(commonShareData);
    }

    // Process preference shares
    pref_shares.forEach(prefShare => {
        const percentCapital = getSharePercentage(prefShare.name);
        const shareData: ShareData = {
            name: prefShare.name,
            percentageCapital: `${percentCapital.toFixed(1)}%`,
            percentageCapitalValue: percentCapital,
            values: {}
        };

        resultAtBreakpoints.exit_values.forEach((exitValue, index) => {
            const value = prefSharesProceeds[prefShare.name]?.[index] || 0;
            const totalExitValue = exitValue + (resultAtBreakpoints.more.options_exercise_proceeds[index] || 0);
            const percentage = totalExitValue > 0 ? (value / totalExitValue) * 100 : 0;
            const isHighlighted = isHighlightedValue(prefShare.name, value);

            shareData.values[exitValue] = {
                value,
                percentage,
                isHighlighted
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

const getPercentage = (shareName: string, exitValue: number): string => {
    const share = transformedData.value.find(s => s.name === shareName);
    const percentage = share?.values[exitValue]?.percentage || 0;
    return `${percentage.toFixed(1)}%`;
};

const getCellClass = (shareName: string, exitValue: number): string => {
    const share = transformedData.value.find(s => s.name === shareName);
    return share?.values[exitValue]?.isHighlighted ? 'text-green-500' : 'text-red-500';
};

// Define table columns based on breakpoints
const columns = computed<TableColumn<ShareData>[]>(() => {
    if (!props.simulation?.results?.result_at_breakpoints?.exit_values) {
        return [];
    }

    const exitValues = props.simulation.results.result_at_breakpoints.exit_values;

    // First columns are static
    const cols: TableColumn<ShareData>[] = [
        {
            accessorKey: 'name',
            header: '',
        },
        {
            accessorKey: 'percentageCapital',
            header: '% Capital FD',
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