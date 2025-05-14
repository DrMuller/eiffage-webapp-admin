<template>
    <div class="m-8 text-center">
        <h3>Actions avec préférences financières</h3>
        <span>
            Le tableau ci-dessous présente les souscriptions d'actions assorties de préférences financières, qu'elles soient statutaires ou contractuelles — cette distinction n'ayant pas d'incidence sur les calculs.<br>Lorsque la préférence est définie comme le maximum entre un multiple de l'investissement et un rendement, la colonne "multiple effectif" indique la valeur maximale retenue pour les calculs dans la visualisation.
        </span>
    </div>
    <UCard variant="outline">
        <template #header>
            <div class="flex items-center">
                <span class="text-lg font-semibold">Historique - Émissions d'actions avec préférences financières</span>
                <UTooltip
arrow
                    text="Actions de préférence statutaires ou actions ordinaires labellisées dont les avantages sont décrits dans le pacte d'actionnaires.">
                    <UButton
icon="material-symbols-light:help" color="neutral" variant="ghost"
                        class="ml-2 text-gray-600" size="xs" aria-label="Info" />
                </UTooltip>
            </div>
        </template>

        <div v-if="estimatedTransferDate" class="body flex items-center mb-4">
            <span class="text-sm">Date de la cession: </span>
            <span class="ml-2 font-medium">{{ formatDate(estimatedTransferDate) }}</span>
            <UTooltip
arrow
                text="Si certains droits financiers préférentiels sont exprimés sous forme de TRI (Taux de Rendement Interne), une date de cession est nécessaire pour calculer les multiples applicables aux actions de préférence concernées.">
                <UButton
icon="material-symbols-light:help" color="neutral" variant="ghost" class="ml-1 text-gray-600"
                    size="xs" aria-label="Info" />
            </UTooltip>
        </div>

        <UTable :data="preferenceShares" :columns="columns">
            <!-- Date cell template -->
            <template #date-cell="{ row }">
                {{ formatDate(row.original.date) }}
            </template>

            <!-- Seniority cell template -->
            <template #seniority-cell="{ row }">
                {{ formatNumber(row.original.seniority) }}
            </template>

            <!-- Number of shares cell template -->
            <template #nb_shares-cell="{ row }">
                {{ formatNumber(row.original.nb_shares) }}
            </template>

            <!-- Share price cell template -->
            <template #share_price-cell="{ row }">
                {{ formatCurrency(row.original.share_price) }}
            </template>

            <!-- Amount cell template -->
            <template #amount-cell="{ row }">
                {{ formatCurrency(row.original.amount) }}
            </template>

            <!-- Preference type cell template -->
            <template #pref_type-cell="{ row }">
                {{ row.original.pref_type === 'P' ? 'Participating' : 'Non-participating' }}
            </template>

            <!-- Multiple cell template -->
            <template #pref_multiple-cell="{ row }">
                {{ row.original.pref_multiple?.toFixed(1) || '-' }}
            </template>

            <!-- TRI cell template -->
            <template #pref_tri-cell="{ row }">
                {{ row.original.pref_tri ? `${row.original.pref_tri}%` : '-' }}
            </template>
        </UTable>

        <template v-if="carveOut" #footer>
            <div class="flex items-center">
                <span class="text-sm">Carve-out: </span>
                <span class="ml-2 font-medium">{{ carveOut }}%</span>
                <UTooltip
arrow
                    text="Le « carve-out » est le pourcentage de la valeur de cession de l'entreprise qui sera distribuée à l'ensemble des actionnaires au prorata de leurs participations avant que les investisseurs détenant des actions de préférence puissent exercer leurs priorités de remboursement.">
                    <UButton
icon="material-symbols-light:help" color="neutral" variant="ghost"
                        class="ml-1 text-gray-600" size="xs" aria-label="Info" />
                </UTooltip>
            </div>
        </template>
    </UCard>
</template>

<script setup lang="ts">
import { h, resolveComponent } from 'vue';
import type { PrefShareRequest } from '~/types/captable';
import type { TableColumn } from '@nuxt/ui';
import { useI18n } from 'vue-i18n';

// Define component props
const props = defineProps<{
    preferenceShares: PrefShareRequest[];
    carveOut: number;
    estimatedTransferDate?: Date;
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
const columns: TableColumn<PrefShareRequest>[] = [
    {
        accessorKey: 'name',
        header: 'Intitulé de l\'émission'
    },
    {
        accessorKey: 'date',
        header: 'Date de l\'émission',
    },
    {
        accessorKey: 'seniority',
        header: () => {
            return h('div', { class: 'flex items-center' }, [
                'Rang de liquidation',
                h(resolveComponent('UTooltip'), {
                    arrow: true,
                    text: "Le rang de liquidité (ou rang de priorité) désigne l'ordre de priorité selon lequel les détenteurs d'actions ayant des préférences financières sont payées en cas de cession ou de liquidation de la société. Un petit rang de liquidité signifie une forte priorité. Les premières actions remboursées sont celles du rang de liquidité 1, puis celles du rang de liquidité 2 et ainsi de suite. Si deux actions ont le même rang de liquidité et un prix de souscription différent, alors elles seront remboursées en respect de la règle « Pari Passu » qui entraine un remboursement proportionnel à leur montant de souscription sans ordre hiérarchique entre elles."
                }, () => [
                    h(resolveComponent('UButton'), {
                        icon: 'material-symbols-light:help',
                        variant: 'ghost',
                        class: 'ml-1 text-gray-600',
                        size: 'xs',
                    })
                ])
            ]);
        }
    },
    {
        accessorKey: 'nb_shares',
        header: 'Nombre d\'actions émises',
    },
    {
        accessorKey: 'share_price',
        header: () => {
            return h('div', { class: 'flex items-center' }, [
                'Prix de souscription (€)',
                h(resolveComponent('UTooltip'), {
                    arrow: true,
                    text: "Prix payé pour souscrire à une action. Ce prix est constitué de la valeur nominale de l'action auquel il peut être ajouté une prime d'émission qui permet de tenir compte de la valeur réelle de l'entreprise."
                }, () => [
                    h(resolveComponent('UButton'), {
                        icon: 'material-symbols-light:help',
                        variant: 'ghost',
                        class: 'ml-1 text-gray-600',
                        size: 'xs',
                    })
                ])
            ]);
        }
    },
    {
        accessorKey: 'amount',
        header: 'Montant total',
    },
    {
        accessorKey: 'pref_type',
        header: () => {
            return h('div', { class: 'flex items-center' }, [
                'Type de participation',
                h(resolveComponent('UTooltip'), {
                    arrow: true,
                    text: "Les actions « participating » récupèrent leur prix de souscription en prioritaire puis partagent en plus le solde restant avec les autres. Le détenteur d'une action paticipating n'a donc pas à choisir s'il active son droit financier préférentiel ou pas. Les actions « non-participating » détiennent un droit de remboursement en priorité, mais sans pouvoir ensuite participer au partage du solde restant après ce remboursement prioritaire. Le détenteur d'une action non-participating choisit soit sa liquidation préférentielle, soit de participer à la répartition globale (prorata) comme un actionnaire ordinaire — mais pas les deux."
                }, () => [
                    h(resolveComponent('UButton'), {
                        icon: 'material-symbols-light:help',
                        variant: 'ghost',
                        class: 'ml-1 text-gray-600',
                        size: 'xs',
                    })
                ])
            ]);
        }
    },
    {
        accessorKey: 'pref_multiple',
        header: () => {
            return h('div', { class: 'flex items-center' }, [
                'Multiple',
                h(resolveComponent('UTooltip'), {
                    arrow: true,
                    text: "Le multiple de rentabilité est l'indicateur de performance qui mesure combien un investisseur espère récupérer par rapport à ce qu'il a investi en payant le prix de souscription d'une action, sans prendre en compte la durée de son investissement."
                }, () => [
                    h(resolveComponent('UButton'), {
                        icon: 'material-symbols-light:help',
                        variant: 'ghost',
                        class: 'ml-1 text-gray-600',
                        size: 'xs',
                    })
                ])
            ]);
        }
    },
    {
        accessorKey: 'pref_tri',
        header: () => {
            return h('div', { class: 'flex items-center' }, [
                'TRI (%)',
                h(resolveComponent('UTooltip'), {
                    arrow: true,
                    text: "Le TRI (Taux de rentabilité interne) est un indicateur de performance qui mesure le rendement annuel composé d'un investissement, en tenant compte du facteur temps. En d'autres termes, c'est le taux de rendement annuel moyen qu'un investisseur espère récupérer par rapport à ce qu'il a investi en payant le prix de souscription d'une action. Chaque année, le rendement est calculé sur une base composée du prix de souscription majoré des gains cumulés des années précédentes."
                }, () => [
                    h(resolveComponent('UButton'), {
                        icon: 'material-symbols-light:help',
                        variant: 'ghost',
                        class: 'ml-1 text-gray-600',
                        size: 'xs',
                    })
                ])
            ]);
        }
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