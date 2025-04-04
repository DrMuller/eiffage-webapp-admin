<template>
    <div>
        <div class="header-container sticky top-0 backdrop-blur-sm bg-white/80 w-full z-10">
            <div class="px-6 py-4">
                <div class="flex justify-between items-center">
                    <h1 class="text-2xl font-bold">Résultats</h1>
                    <UButton color="primary" icon="i-heroicons-document-text" cursor-pointer @click="router.push('/')">
                        Modifier la simulation
                    </UButton>
                </div>
            </div>
        </div>
        <div class="mt-4 px-6 mb-8">
            <div class="space-y-12">
                <div>
                    <h2 class="text-2xl font-semibold mb-4">Prix par action en fonction de la valeur des titres</h2>
                    <div class="prose prose-sm text-gray-600 dark:text-gray-400 mb-4">
                        <p>Le graphique ci-dessous illustre, pour chaque classe d'actions, l'évolution du prix par
                            action en
                            fonction de la valeur des titres.</p>
                        <p>Les actions avec un rang de priorité plus élevé (le rang 1 étant le plus prioritaire) captent
                            en
                            premier la valeur.</p>
                        <p>Pour simplifier l'observation, une classe d'actions peut être isolée via le panneau de
                            sélectionen à droite du graphique.</p>
                    </div>
                    <ChartsLine :x="chartData.exitValues" :y-series="chartData.sharePriceSeries"
                        x-axis-label="Valeur des titres (€)" y-axis-label="Prix par action (€)" :display-points="false"
                        :show-tooltip="true" />
                </div>
                <div>
                    <h2 class="text-2xl font-semibold mb-4">Valeur des titres par catégorie d'actions</h2>
                    <div class="prose prose-sm text-gray-600 dark:text-gray-400 mb-4">
                        <p>Le graphique ci-dessous montre l'évolution de la valeur de chaque catégorie d'actions en
                            fonction de la valeur des titres.</p>
                        <p>Cette valeur est calculée en multipliant le nombre d'actions par leur prix unitaire.</p>
                        <p>En présence d'options, les petites discontinuités visibles sur la courbe des actions
                            ordinaires correspondent aux points où les options deviennent exerçables. Leur exercice
                            augmente le nombre d'actions, entraînant de fait une hausse de la valeur totale de la
                            catégorie.</p>
                    </div>
                    <ChartsLine :x="chartData.exitValues" :y-series="chartData.proceedsSeries"
                        x-axis-label="Valeur des titres (€)" y-axis-label="Valeur de la catégorie de titres (€)"
                        :display-points="false" :show-tooltip="true" />
                </div>
                <div>
                    <h2 class="text-2xl font-semibold mb-4">Valeur des titres par empilement des catégories d'actions
                    </h2>
                    <div class="prose prose-sm text-gray-600 dark:text-gray-400 mb-4">
                        <p>Ce graphique complète le précédent en empilant les courbes des différentes catégories
                            d'actions,
                            offrant ainsi une visualisation claire de la répartition de la valeur des titres entre les
                            classes.</p>
                    </div>
                    <ChartsLine :x="chartData.exitValues" :y-series="chartData.proceedsSeries"
                        x-axis-label="Valeur des titres (€)" y-axis-label="Valeur de la catégorie de titres (€)"
                        :display-points="false" :stacked="true" />
                </div>
                <h2 class="text-2xl font-semibold mb-4">Points de remboursement des différentes catégories
                    d'actions de préférence
                </h2>
                <div class="prose prose-sm text-gray-600 dark:text-gray-400 mb-4">
                    <p>Le point de remboursement d\'une catégorie d'actions correspond au moment où sa préférence
                        financière est intégralement satisfaite.</p>
                </div>
                <!-- Preferred Shares Redemption Table -->
                <UCard variant="outline" class="w-full mb-8">
                    <div class="body">
                        <SimulationPreferredSharesRedemptionTable :simulation="simulation" />
                    </div>
                </UCard>

                <!-- Share Valuation Table -->
                <h2 class="text-2xl font-semibold mb-4">Prix par action aux points de remboursement des actions de
                    préférence</h2>
                <div class="prose prose-sm text-gray-600 dark:text-gray-400 mb-4">
                    <p>Les points de remboursement sont des repères clés marquant la satisfaction d'une priorité de
                        remboursement. Le prix par action observé à ces seuils illustre les différences de captation de
                        valeur entre les différentes classes d'actions.</p>
                </div>
                <UCard variant="outline" class="w-full mb-8">
                    <div class="body">
                        <SimulationShareValuationTable :simulation="simulation" />
                    </div>
                </UCard>

                <!-- Exercise Points Table -->
                <h2 class="text-2xl font-semibold mb-4">Points d'exercice des options</h2>
                <div class="prose prose-sm text-gray-600 dark:text-gray-400 mb-4">
                    <p>Le point d'exercice d'une option correspond au seuil à partir duquel son exercice devient
                        économiquement
                        avantageux, c'est-à-dire lorsque le prix de revente de l'action couvre au moins son prix d'achat
                        ou prix d'exercice.</p>
                    <p>Le tableau ci-dessous indique, pour chaque catégorie d'options, la valeur des titres à partir de
                        laquelle les options
                        deviennent "dans la monnaie".</p>
                </div>
                <UCard variant="outline" class="w-full mb-8">
                    <div class="body">
                        <SimulationExercisePointsTable :simulation="simulation" />
                    </div>
                </UCard>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">

useHead({ title: 'Dashboard' })
definePageMeta({
    middleware: ['auth'],
    requiresAuth: true
})

// get simulation id from url
const route = useRoute();
const simulationId = route.params.id;
const { fetchLastSimulation, fetchSimulationById } = useSimulation();
const { transformSimulationResults } = useSimulationChart();
const router = useRouter();

// Define type for chart data
interface ChartSeriesItem {
    values: number[];
    color: string;
    dash?: number[];
    lineWidth?: number;
}

interface ChartData {
    exitValues: number[];
    sharePriceSeries: Record<string, ChartSeriesItem>;
    proceedsSeries: Record<string, ChartSeriesItem>;
}

// Initialize chartData ref with proper type
const chartData = ref<ChartData>({
    exitValues: [],
    sharePriceSeries: {},
    proceedsSeries: {}
});

// Fetch simulation data based on the ID parameter
const simulation = await (Array.isArray(simulationId) && simulationId[0] === undefined
    ? fetchLastSimulation()
    : fetchSimulationById(Array.isArray(simulationId) ? simulationId[0] : simulationId as string));

// Import the ExercisePointsTable component
import SimulationExercisePointsTable from '~/components/Simulation/ExercisePointsTable.vue';

if (!simulation) {
    throw createError({
        statusCode: 404,
        statusMessage: 'Simulation not found'
    });
}

// Transform simulation results and assign to chartData ref
chartData.value = transformSimulationResults(simulation.results);

// const sharePriceSeries = {
//     'Series A': { values: [0, 0.5, 1, 1, 1, 1, 1.2, 1.4, 1.6, 1.8, 2.0], color: '#004f63' },
//     'Series B': { values: [0, 0, 0, 0.8, 1, 1, 1.2, 1.4, 1.6, 1.8, 2.0], color: '#08878a' },
//     'Actions ordinaires': { values: [0, 0, 0, 0, 0, 0, 1.2, 1.4, 1.6, 1.8, 2.0], color: '#77bfa8' },
//     'Prorata FD': {
//         values: ['', '', '', '', 0.8, 1.0, 1.2, 1.4, 1.6, 1.8, 2.0],
//         color: '#bbb',
//         dash: [5, 5],
//         lineWidth: 2
//     }
// };
// const proceedsSeries = {
//     'Series A': { values: [0, 25000, 50000, 50000, 50000, 50000, 60000, 70000, 80000, 90000, 100000], color: '#004f63' },
//     'Series B': { values: [0, 0, 0, 40000, 50000, 50000, 60000, 70000, 80000, 90000, 100000], color: '#08878a' },
//     'Actions ordinaires': { values: [0, 0, 0, 0, 0, 0, 120000, 140000, 160000, 180000, 200000], color: '#77bfa8' },
// };
</script>