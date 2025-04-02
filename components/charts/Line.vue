<template>
    <UCard>
        <template v-if="title" #header>
            <h3 class="text-lg font-semibold">{{ title }}</h3>
        </template>
        <div class="px-4 py-6 min-h-[600px]">
            <Line :data="chartData" :options="chartOptions" />
        </div>
    </UCard>
</template>

<script setup lang="ts">
import type { ChartOptions } from 'chart.js'
import {
    Chart as ChartJS,
    CategoryScale,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Filler
} from 'chart.js'
import { computed } from 'vue'
import { Line } from 'vue-chartjs'

ChartJS.register(Title, Tooltip, Legend, LinearScale, CategoryScale, PointElement, LineElement, Filler)
type DataPoint = { x: number; y: number }

interface SeriesItem {
    values: (number | string | null)[]
    color: string
    lineWidth?: number
    dash?: number[]
}

interface YSeries {
    [key: string]: SeriesItem
}

interface Props {
    title?: string
    x: (number | string)[]
    ySeries: YSeries
    xAxisLabel?: string | null
    yAxisLabel?: string | null
    displayPoints?: boolean
    stacked?: boolean
    showTooltip?: boolean
    categorical?: boolean
}

// Props with defaults
const props = withDefaults(defineProps<Props>(), {
    xAxisLabel: null,
    yAxisLabel: null,
    displayPoints: true,
    stacked: false,
    showTooltip: true,
    categorical: false,
})

// Convert raw data to chart-compatible data points
const createDataPoints = (xValues: (number | string)[], yValues: (number | string | null)[]): DataPoint[] => {
    return xValues.reduce<DataPoint[]>((points, x, index) => {
        const y = yValues[index]
        if (y !== null && y !== undefined && y !== '') {
            points.push({ x: Number(x), y: Number(y) })
        }
        return points
    }, [])
}

// Chart data configuration
const chartData = computed(() => ({
    labels: props.categorical ? props.x.map(x => String(x)) : undefined,
    datasets: Object.entries(props.ySeries).map(([label, data]) => {
        const dataset = {
            label,
            backgroundColor: data.color,
            borderColor: data.color,
            data: props.categorical
                ? data.values.filter(y => y !== null && y !== undefined && y !== '').map(y => Number(y))
                : createDataPoints(props.x, data.values),
            borderWidth: data.lineWidth ?? 1.75,
            pointRadius: props.displayPoints ? undefined : 0,
            showLine: true,
            spanGaps: true,
            fill: props.stacked,
        }

        // Add border dash pattern if specified
        if (data.dash?.length) {
            return { ...dataset, borderDash: [...data.dash] }
        }

        return dataset
    })
}))

// Chart options configuration
const chartOptions = computed<ChartOptions<'line'>>(() => ({
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 1400 },

    plugins: {
        tooltip: {
            enabled: props.showTooltip,
            mode: 'nearest',
            intersect: false,
        },
        title: { display: true }, // Title handled by UCard
        legend: {
            display: true,
            position: 'top' as const,
        },
    },
    // interaction: {
    //     mode: 'nearest',
    //     axis: 'x',
    //     intersect: false
    // },
    scales: {
        x: {
            type: props.categorical ? 'category' : 'linear' as const,
            title: {
                display: Boolean(props.xAxisLabel),
                text: props.xAxisLabel || '',
                font: { size: 14 },
            },
        },
        y: {
            stacked: props.stacked,
            title: {
                display: Boolean(props.yAxisLabel),
                text: props.yAxisLabel || '',
                font: { size: 14 },
            },
        },
    },
}))
</script>