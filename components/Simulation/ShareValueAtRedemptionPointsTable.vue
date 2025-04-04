<template>
    <div>
        <UTable :data="tableData" :columns="columns">
            <!-- Percentage cell template -->
            <template #percentageCapital-cell="{ row }">
                {{ row.original.percentageCapital }}
            </template>

            <!-- Dynamic cell templates for each breakpoint -->
            <template v-for="breakpoint in breakpoints" :key="breakpoint.id" #[`value-${breakpoint.id}-cell`]="{ row }">
                <div>
                    <div
                        :class="{ 'text-green-500': isHighlightedValue(row.original.percentageCapitalValue, row.original[`percentage-${breakpoint.id}`]) }">
                        {{ row.original[`value-${breakpoint.id}`] }}
                    </div>
                    <div class="text-gray-500 text-sm">
                        {{ row.original[`percentage-${breakpoint.id}`] }}
                    </div>
                </div>
            </template>
        </UTable>
    </div>
</template>

<script setup lang="ts">
import { computed, h } from 'vue';
import { resolveComponent } from 'vue';
import type { TableColumn } from '@nuxt/ui';
import type { Simulation } from '~/types/simulation';

// Define breakpoint types
interface Breakpoint {
    id: string;
    value: number;
    label: string;
    sublabel?: string;
}

// Define row data type
interface ShareValueRow {
    shareName: string;
    percentageCapital: string;
    percentageCapitalValue: number;
    [key: string]: string | number; // For dynamic breakpoint values and percentages
}

// Define props for the component
const props = defineProps<{
    simulation: Simulation;
}>();

// Determine if a value percentage should be highlighted (higher than capital percentage)
const isHighlightedValue = (capitalPercentage: number, valuePercentage: string | number) => {
    if (!valuePercentage) return false;

    // Parse percentage value (remove % and convert to number)
    const percentValue = typeof valuePercentage === 'string'
        ? parseFloat(valuePercentage.replace('%', ''))
        : valuePercentage;

    // Compare - if value percentage is higher than capital percentage, highlight it
    return percentValue > capitalPercentage;
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

// Compute breakpoints based on simulation data
const breakpoints = computed<Breakpoint[]>(() => {
    if (!props.simulation?.results?.pref_shares_refund_breakpoints) {
        return [];
    }

    const { pref_shares_refund_breakpoints } = props.simulation.results;
    const breakpointEntries = Object.entries(pref_shares_refund_breakpoints)
        .filter(([key]) => key !== 'all_shares_at_prorata');

    // Create unique breakpoints with labels
    const uniqueBreakpoints = new Map<number, Breakpoint>();

    // First pass: collect all breakpoints
    breakpointEntries.forEach(([key, value]) => {
        if (!uniqueBreakpoints.has(value)) {
            uniqueBreakpoints.set(value, {
                id: key.toLowerCase().replace(/\s+/g, ''),
                value,
                label: `VT = ${formatCurrency(value)}`,
                sublabel: key
            });
        }
    });

    // Add the prorata point if it exists
    if (pref_shares_refund_breakpoints.all_shares_at_prorata) {
        uniqueBreakpoints.set(pref_shares_refund_breakpoints.all_shares_at_prorata, {
            id: 'prorata',
            value: pref_shares_refund_breakpoints.all_shares_at_prorata,
            label: `VT = ${formatCurrency(pref_shares_refund_breakpoints.all_shares_at_prorata)}`,
            sublabel: 'Prorata complet'
        });
    }

    // Sort by value and return as array
    return Array.from(uniqueBreakpoints.values()).sort((a, b) => a.value - b.value);
});

// Define table columns
const columns = computed<TableColumn<ShareValueRow>[]>(() => {
    const cols: TableColumn<ShareValueRow>[] = [
        {
            accessorKey: 'shareName',
            header: '',
        },
        {
            accessorKey: 'percentageCapital',
            header: '% Capital FD',
        }
    ];

    // Add a column for each breakpoint
    breakpoints.value.forEach(breakpoint => {
        cols.push({
            accessorKey: `value-${breakpoint.id}`,
            header: () => {
                return h('div', [
                    h('div', {}, breakpoint.label),
                    h('div', { class: 'font-normal' }, breakpoint.sublabel)
                ]);
            }
        });
    });

    return cols;
});

// Generate table data from simulation results
const tableData = computed<ShareValueRow[]>(() => {
    if (!props.simulation?.results?.proceeds || !breakpoints.value.length) {
        return [];
    }

    // Prepare array for rows
    const rows: ShareValueRow[] = [];

    // Get the exit values and proceeds data
    const { exit_values, proceeds } = props.simulation.results;
    const { pref_shares } = props.simulation.request;

    // Add rows for preferred shares
    pref_shares.forEach(prefShare => {
        const percentCapital = getSharePercentage(prefShare.name);

        const row: ShareValueRow = {
            shareName: prefShare.name,
            percentageCapital: `${percentCapital.toFixed(1)}%`,
            percentageCapitalValue: percentCapital
        };

        // Add data for each breakpoint
        breakpoints.value.forEach(breakpoint => {
            // Find closest exit value index
            const closestIndex = findClosestExitValueIndex(exit_values, breakpoint.value);

            // Get the proceeds at this point
            const proceedsValue = proceeds.pref_shares[prefShare.name]?.[closestIndex] || 0;

            // Calculate percentage of total proceeds
            const totalProceeds = getTotalProceeds(closestIndex);
            const percentage = totalProceeds > 0 ? (proceedsValue / totalProceeds) * 100 : 0;

            // Add to row
            row[`value-${breakpoint.id}`] = formatCurrency(proceedsValue);
            row[`percentage-${breakpoint.id}`] = `${percentage.toFixed(1)}%`;
        });

        rows.push(row);
    });

    // Add row for common shares
    const commonPercentCapital = getSharePercentage('Actions ordinaires');
    const commonRow: ShareValueRow = {
        shareName: 'Actions ordinaires',
        percentageCapital: `${commonPercentCapital.toFixed(1)}%`,
        percentageCapitalValue: commonPercentCapital
    };

    // Add data for each breakpoint
    breakpoints.value.forEach(breakpoint => {
        // Find closest exit value index
        const closestIndex = findClosestExitValueIndex(exit_values, breakpoint.value);

        // Get the proceeds at this point
        const proceedsValue = proceeds.common_shares[closestIndex] || 0;

        // Calculate percentage of total proceeds
        const totalProceeds = getTotalProceeds(closestIndex);
        const percentage = totalProceeds > 0 ? (proceedsValue / totalProceeds) * 100 : 0;

        // Add to row
        commonRow[`value-${breakpoint.id}`] = formatCurrency(proceedsValue);
        commonRow[`percentage-${breakpoint.id}`] = `${percentage.toFixed(1)}%`;
    });

    rows.push(commonRow);

    return rows;
});

// Find the index of the closest exit value to a given value
const findClosestExitValueIndex = (exitValues: number[], targetValue: number) => {
    let closestIndex = 0;
    let minDiff = Number.MAX_VALUE;

    exitValues.forEach((value, index) => {
        const diff = Math.abs(value - targetValue);
        if (diff < minDiff) {
            minDiff = diff;
            closestIndex = index;
        }
    });

    return closestIndex;
};

// Calculate total proceeds at a given exit value index
const getTotalProceeds = (exitValueIndex: number) => {
    const { proceeds } = props.simulation.results;

    // Sum preferred shares proceeds
    let total = 0;
    Object.values(proceeds.pref_shares).forEach(values => {
        total += values[exitValueIndex] || 0;
    });

    // Add common shares proceeds
    total += proceeds.common_shares[exitValueIndex] || 0;

    return total;
};

// Format a number as currency (EUR)
const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
        style: 'decimal',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value) + ' €';
};
</script>