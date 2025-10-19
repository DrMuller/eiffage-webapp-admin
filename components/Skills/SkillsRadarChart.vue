<template>
    <div class="w-full">
        <Radar :data="chartData" :options="chartOptions" />
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Radar } from 'vue-chartjs'
import {
    Chart as ChartJS,
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend
} from 'chart.js'

// Register Chart.js components
ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend)

interface SkillComparison {
    skillId: string
    skillName: string
    expectedLevel: number
    currentLevel: number
}

interface Props {
    skills: SkillComparison[]
    showLabels?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    showLabels: true
})

const chartData = computed(() => {
    const labels = props.skills.map(skill => skill.skillName)
    const expectedLevels = props.skills.map(skill => skill.expectedLevel)
    const currentLevels = props.skills.map(skill => skill.currentLevel)

    return {
        labels,
        datasets: [
            {
                label: 'Niveau attendu',
                data: expectedLevels,
                backgroundColor: 'rgba(59, 130, 246, 0.2)', // Blue
                borderColor: 'rgb(59, 130, 246)',
                borderWidth: 2,
                pointBackgroundColor: 'rgb(59, 130, 246)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgb(59, 130, 246)',
            },
            {
                label: 'Niveau actuel',
                data: currentLevels,
                backgroundColor: 'rgba(16, 185, 129, 0.2)', // Green
                borderColor: 'rgb(16, 185, 129)',
                borderWidth: 2,
                pointBackgroundColor: 'rgb(16, 185, 129)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgb(16, 185, 129)',
            },
        ],
    }
})

const chartOptions = computed(() => ({
    responsive: true,
    maintainAspectRatio: true,
    scales: {
        r: {
            beginAtZero: true,
            min: 0,
            max: 4,
            ticks: {
                stepSize: 1,
                color: 'rgb(107, 114, 128)', // gray-500
            },
            grid: {
                color: 'rgba(107, 114, 128, 0.2)',
            },
            pointLabels: {
                display: props.showLabels,
                color: 'rgb(17, 24, 39)', // gray-900
                font: {
                    size: 12,
                    weight: 'normal' as const,
                },
            },
        },
    },
    plugins: {
        legend: {
            position: 'bottom' as const,
            labels: {
                color: 'rgb(17, 24, 39)', // gray-900
                font: {
                    size: 14,
                    weight: 'normal' as const,
                },
                padding: 15,
            },
        },
        tooltip: {
            backgroundColor: 'rgba(17, 24, 39, 0.9)',
            padding: 12,
            titleFont: {
                size: 14,
            },
            bodyFont: {
                size: 13,
            },
        },
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
}) as any)
</script>
