<template>
    <UContainer class="py-8">
        <h1 class="text-3xl font-bold mb-6">Waterfall Simulation Results</h1>

        <div class="space-y-12">
            <!-- Share Price Chart -->
            <div>
                <h2 class="text-2xl font-semibold mb-4">Prix par action en fonction de la valeur des titres</h2>
                <div class="prose prose-sm text-gray-600 dark:text-gray-400 mb-4">
                    <p>Le graphique ci-dessous illustre, pour chaque classe d'actions, l'évolution du prix par action en
                        fonction de la valeur des titres.</p>
                    <p>Les actions avec un rang de priorité plus élevé (le rang 1 étant le plus prioritaire) captent en
                        premier la valeur.</p>
                    <p>Pour simplifier l'observation, une classe d'actions peut être isolée via le panneau de sélection
                        à droite du graphique.</p>
                </div>
                <ChartsLine :x="exitValues" :y-series="sharePriceSeries" x-axis-label="Valeur des titres (€)"
                    y-axis-label="Prix par action (€)" :display-points="false" :show-tooltip="true" />
                <!-- TODO: Add prorata FD line with dashed style -->
            </div>

            <!-- Proceeds Chart -->
            <div>
                <h2 class="text-2xl font-semibold mb-4">Valeur des titres par catégorie d'actions</h2>
                <div class="prose prose-sm text-gray-600 dark:text-gray-400 mb-4">
                    <p>Le graphique ci-dessous montre l'évolution de la valeur de chaque catégorie d'actions en fonction
                        de la valeur des titres.</p>
                    <p>Cette valeur est calculée en multipliant le nombre d'actions par leur prix unitaire.</p>
                    <p>En présence d'options, les petites discontinuités visibles sur la courbe des actions ordinaires
                        correspondent aux points où les options deviennent exerçables. Leur exercice augmente le nombre
                        d'actions, entraînant de fait une hausse de la valeur totale de la catégorie.</p>
                </div>
                <ChartsLine :x="exitValues" :y-series="proceedsSeries" x-axis-label="Valeur des titres (€)"
                    y-axis-label="Valeur de la catégorie de titres (€)" :display-points="false" :show-tooltip="true" />
            </div>

            <!-- Stacked Proceeds Chart -->
            <div>
                <h2 class="text-2xl font-semibold mb-4">Valeur des titres par empilement des catégories d'actions</h2>
                <div class="prose prose-sm text-gray-600 dark:text-gray-400 mb-4">
                    <p>Ce graphique complète le précédent en empilant les courbes des différentes catégories d'actions,
                        offrant ainsi une visualisation claire de la répartition de la valeur des titres entre les
                        classes.</p>
                </div>
                <ChartsLine :x="exitValues" :y-series="proceedsSeries" x-axis-label="Valeur des titres (€)"
                    y-axis-label="Valeur de la catégorie de titres (€)" :display-points="false" :stacked="true" />

            </div>
        </div>
    </UContainer>
</template>

<script setup lang="ts">


useHead({ title: 'Dashboard' })
definePageMeta({
    middleware: ['auth'],
    requiresAuth: true
})

// TODO: Replace with actual data from simulation results
// These are placeholder structures based on the PHP output and existing chart components

// Sample X-axis values (Valeur des titres)
const exitValues = [0, 50000, 100000, 150000, 200000, 250000, 300000, 350000, 400000, 450000, 500000]; // Example values

// Sample Y-series data for Share Price Chart
// Corresponds to $share_price_plot_series in PHP
const sharePriceSeries = {
    'Series A': { values: [0, 0.5, 1, 1, 1, 1, 1.2, 1.4, 1.6, 1.8, 2.0], color: '#004f63' },
    'Series B': { values: [0, 0, 0, 0.8, 1, 1, 1.2, 1.4, 1.6, 1.8, 2.0], color: '#08878a' },
    'Actions ordinaires': { values: [0, 0, 0, 0, 0, 0, 1.2, 1.4, 1.6, 1.8, 2.0], color: '#77bfa8' },
    'Prorata FD': {
        values: ['', '', '', '', 0.8, 1.0, 1.2, 1.4, 1.6, 1.8, 2.0],
        color: '#bbb',
        dash: [5, 5],
        lineWidth: 2
    }
};

// Sample Y-series data for Proceeds and Stacked Proceeds Charts
// Corresponds to $proceeds_plot_series in PHP
const proceedsSeries = {
    'Series A': { values: [0, 25000, 50000, 50000, 50000, 50000, 60000, 70000, 80000, 90000, 100000], color: '#004f63' },
    'Series B': { values: [0, 0, 0, 40000, 50000, 50000, 60000, 70000, 80000, 90000, 100000], color: '#08878a' },
    'Actions ordinaires': { values: [0, 0, 0, 0, 0, 0, 120000, 140000, 160000, 180000, 200000], color: '#77bfa8' },
};

// Define page meta if needed (e.g., for layout)
// definePageMeta({
//   layout: 'default',
// });
</script>

<!-- <style scoped>
/* Add specific styles for this page if needed */
.prose p {
    margin-bottom: 0.5em;
    /* Adjust spacing for description paragraphs */
}

/* Ensure chart containers have a defined height for responsiveness */
:deep(.u-card) {
    /* You might need to adjust height based on your layout */
    min-height: 450px;
    /* Example minimum height */
}

:deep(canvas) {
    max-height: 400px;
    /* Ensure canvas doesn't overflow card padding */
}
</style> -->