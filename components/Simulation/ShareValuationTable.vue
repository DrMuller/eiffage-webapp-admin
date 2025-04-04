<template>
    <div>
        <UTable :data="tableData" :columns="columns">
            <!-- Dynamic cell template for each column -->
            <template
v-for="breakpoint in uniqueBreakpoints" :key="breakpoint.value"
                #[`breakpoint-${breakpoint.value}-cell`]="{ row }">
                <span
                    :class="isGreen(row.original.shareName, row.original[`breakpoint-${breakpoint.value}`]) ? 'text-green-500' : ''">
                    {{ row.original.shareName }}
                    {{ row.original[`breakpoint-${breakpoint.value}`] }}
                    {{ formatCurrency(row.original[`breakpoint-${breakpoint.value}`]) }}
                </span>
            </template>
        </UTable>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { TableColumn } from '@nuxt/ui';
import type { Simulation } from '~/types/simulation';

// Define props for the component
const props = defineProps<{
    simulation: Simulation;
}>();

const isGreen = (shareName: string, value: number) => {
    const initialSharePrice = props.simulation.request.pref_shares.find(share => share.name === shareName)?.share_price ?? 0;
    console.log(initialSharePrice, value)
    return initialSharePrice <= value;
}

// Compute unique breakpoints (deduplicated)
const uniqueBreakpoints = computed(() => {
    if (!props.simulation?.results?.pref_shares_refund_breakpoints) {
        return [];
    }

    const { pref_shares_refund_breakpoints } = props.simulation.results;

    // Create an array of unique breakpoints with their keys
    const breakpointSet = new Map<number, { value: number, keys: string[] }>();

    Object.entries(pref_shares_refund_breakpoints)
        .filter(([key]) => key !== 'all_shares_at_prorata')
        .forEach(([key, value]) => {
            if (breakpointSet.has(value)) {
                // Add the key to existing breakpoint
                breakpointSet.get(value)?.keys.push(key);
            } else {
                // Create new breakpoint entry
                breakpointSet.set(value, { value, keys: [key] });
            }
        });

    // Convert to array and sort by value
    return Array.from(breakpointSet.values()).sort((a, b) => a.value - b.value);
});

// Generate table data from the simulation result
const tableData = computed(() => {
    if (!props.simulation?.results?.pref_shares_refund_breakpoints || !props.simulation?.results?.share_price) {
        return [];
    }

    const { pref_shares } = props.simulation.request;
    const { share_price } = props.simulation.results;
    const breakpoints = uniqueBreakpoints.value;

    // Create rows for each key in pref_shares
    const rows = pref_shares.map(prefShare => {
        // Create an object with the share name as the row identifier
        const row: Record<string, any> = {
            shareName: prefShare.name
        };

        // Add a value for each unique breakpoint
        breakpoints.forEach(breakpoint => {
            // Find the index in the exit_values array that is closest to the breakpoint
            const exitValues = props.simulation.results.exit_values;

            let closestIndex = 0;
            let minDiff = Number.MAX_VALUE;

            exitValues.forEach((value, index) => {
                const diff = Math.abs(value - breakpoint.value);
                if (diff < minDiff) {
                    minDiff = diff;
                    closestIndex = index;
                }
            });

            // Get the share price at that point
            row[`breakpoint-${breakpoint.value}`] = share_price.pref_shares[prefShare.name]?.[closestIndex] || 0;
        });

        return row;
    }).reverse();

    // Add a row for common shares
    if (props.simulation.results.share_price.common_shares) {
        const commonRow: Record<string, any> = {
            shareName: 'Actions ordinaires'
        };

        breakpoints.forEach(breakpoint => {
            const exitValues = props.simulation.results.exit_values;

            let closestIndex = 0;
            let minDiff = Number.MAX_VALUE;

            exitValues.forEach((value, index) => {
                const diff = Math.abs(value - breakpoint.value);
                if (diff < minDiff) {
                    minDiff = diff;
                    closestIndex = index;
                }
            });

            commonRow[`breakpoint-${breakpoint.value}`] = props.simulation.results.share_price.common_shares[closestIndex] || 0;
        });

        rows.push(commonRow);
    }

    return rows;
});

// Define table columns based on breakpoints
const columns = computed<TableColumn<any>[]>(() => {
    if (!props.simulation?.results?.pref_shares_refund_breakpoints) {
        return [];
    }

    // First column is static - the share name
    const cols: TableColumn<any>[] = [
        {
            accessorKey: 'shareName',
            header: '',
        }
    ];

    // Add a column for each unique breakpoint
    uniqueBreakpoints.value.forEach(breakpoint => {
        cols.push({
            accessorKey: `breakpoint-${breakpoint.value}`,
            header: `VT = ${formatCurrency(breakpoint.value)}\n${breakpoint.keys.join(', ')}`,
        });
    });

    return cols;
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