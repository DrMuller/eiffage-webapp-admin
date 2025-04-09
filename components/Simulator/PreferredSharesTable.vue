<template>
    <UCard variant="outline">
        <template #header>
            <div class="flex items-center">
                <span class="text-lg font-semibold">Historique - Émissions d'actions avec préférences financières</span>
                <UTooltip arrow
                    text="Actions de préférence statutaires ou actions ordinaires labellisées dont les avantages sont décrits dans le pacte d'actionnaires.">
                    <UButton icon="material-symbols-light:help" color="neutral" variant="ghost"
                        class="ml-2 text-gray-600" size="xs" aria-label="Info" />
                </UTooltip>
            </div>
        </template>



        <div class="body flex items-center justify-end">
            <label class="ml-4 text-sm">Date de la cession</label>
            <UTooltip arrow
                text="Si certains droits financiers préférentiels sont exprimés sous forme de TRI (Taux de Rendement Interne), une date de cession est nécessaire pour calculer les multiples applicables aux actions de préférence concernées. À défaut, ce champ peut rester vide.">
                <UButton icon="material-symbols-light:help" color="neutral" variant="ghost" class="ml-1 text-gray-600"
                    size="xs" aria-label="Info" />
            </UTooltip>
            <DatePicker v-model="localEstimatedTransferDate" />
        </div>

        <UTable :data="localPreferenceShares" :columns="columns">
            <!-- Name cell template -->
            <template #name-cell="{ row }">
                <UInput v-model="row.original.name" class="w-full" required />
            </template>

            <!-- Date cell template -->
            <template #date-cell="{ row }">
                <DatePicker v-model="row.original.date" class="w-full" required />
            </template>

            <!-- Seniority cell template -->
            <template #seniority-cell="{ row }">
                <UInputNumber v-model="row.original.seniority" orientation="vertical" class="w-full" :min="1" required
                    style="padding-right: 1rem;" :ui="{ increment: 'inline-flex', decrement: 'inline-flex' }"
                    :locale="locale" />
            </template>

            <!-- Shares count cell template -->
            <template #nb_shares-cell="{ row }">
                <UInputNumber v-model="row.original.nb_shares" orientation="vertical" class="w-full" :min="0" required
                    :locale="locale" @update:model-value="() => updateAmount(row.index)" />
            </template>

            <!-- Share price cell template -->
            <template #share_price-cell="{ row }">
                <UInputNumber v-model="row.original.share_price" orientation="vertical" class="w-full" :step="0.01"
                    :min="0" required :locale="locale" @update:model-value="() => updateAmount(row.index)" />
            </template>

            <!-- Preference type cell template -->
            <template #pref_type-cell="{ row }">
                <div class="relative">
                    <USelect v-model="row.original.pref_type" class="w-full" :ui="{
                        content: 'min-w-[200px]'

                    }" :items="[{
                        label: 'Participating',
                        value: 'P'
                    }, {
                        label: 'Non-participating',
                        value: 'NP'
                    }]" required>
                        <span>
                            {{ row.original.pref_type }}
                        </span>
                    </USelect>
                </div>
            </template>

            <!-- Multiple cell template -->
            <template #pref_multiple-cell="{ row }">
                <UInputNumber v-model="row.original.pref_multiple" orientation="vertical" class="w-full" :step="0.1"
                    :min="1" required :locale="locale" @update:model-value="() => updateAmount(row.index)" />
            </template>

            <!-- TRI cell template -->
            <template #pref_tri-cell="{ row }">
                <UInputNumber v-model="row.original.pref_tri" orientation="vertical" class="w-full" :min="0" required
                    :locale="locale" />
            </template>

            <!-- Actions cell template -->
            <template #actions-cell="{ row }">
                <div class="flex justify-end">
                    <UButton type="button" color="error" icon="material-symbols-light:delete-outline-rounded" size="md"
                        aria-label="Delete" @click="() => deleteShare(row.index)" />
                </div>
            </template>
        </UTable>

        <template #footer>
            <div class="flex items-center justify-between">
                <div>
                    <UButton variant="ghost" icon="i-heroicons-plus" class="text-sm" @click="addNewShare">
                        Ajouter une émission d'actions de préférence
                    </UButton>
                </div>
                <div class=" flex items-center">
                    <label class="text-sm">Carve-out (%)</label>
                    <UTooltip arrow
                        text="Le « carve-out » est le pourcentage de la valeur de cession de l'entreprise qui sera distribuée à l'ensemble des actionnaires au prorata de leurs participations avant que les investisseurs détenant des actions de préférence puissent exercer leurs priorités de remboursement.">
                        <UButton icon="material-symbols-light:help" color="neutral" variant="ghost"
                            class="ml-1 text-gray-600" size="xs" aria-label="Info" />
                    </UTooltip>
                    <UInput v-model="localCarveOutValue" arrow class="w-32" />
                </div>
            </div>
        </template>
    </UCard>
</template>

<script setup lang="ts">
import { computed, h, resolveComponent } from 'vue';
import type { PrefShare } from '~/types/simulationRequest';
import type { TableColumn } from '@nuxt/ui';
import { useI18n } from 'vue-i18n';

// Define component props
const props = defineProps<{
    preferenceShares: PrefShare[];
    carveOut: number;
    estimatedTransferDate: Date;
}>();

// Define emits
const emit = defineEmits<{
    'update:preference-shares': [shares: PrefShare[]];
    'update:carve-out': [value: number];
    'update:estimated-transfer-date': [date: Date];
}>();

// Get current locale
const { locale } = useI18n();

// Create local reactive copies of the props
const localPreferenceShares = computed({
    get: () => props.preferenceShares,
    set: (value) => emit('update:preference-shares', value)
});

const localCarveOutValue = computed({
    get: () => props.carveOut,
    set: (value) => emit('update:carve-out', Number(value))
});

const localEstimatedTransferDate = computed({
    get: () => props.estimatedTransferDate,
    set: (value) => emit('update:estimated-transfer-date', value)
});

// Define table columns
const columns: TableColumn<PrefShare>[] = [
    {
        accessorKey: 'name',
        meta: {
            class: {
                td: 'w-[290px]',
                th: 'w-[290px]'
            }
        },
        header: 'Intitulé de l\'émission'
    },
    {
        accessorKey: 'date',
        header: 'Date de l\'émission',
        meta: {
            class: {
                td: 'w-[180px]',
                th: 'w-[180px]'
            }
        },
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
        meta: {
            class: {
                td: 'w-[180px]',
                th: 'w-[180px]'
            }
        },
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
    },
    {
        id: 'actions',
        header: '',
        meta: {
            class: {
                td: 'w-[54px]',
                th: 'w-[54px]'
            }
        }
    }
];

// Function to update amount and preference-related values
const updateAmount = (index: number) => {
    const share = localPreferenceShares.value[index];
    share.amount = share.nb_shares * share.share_price;
    share.pref_share_price = share.share_price;
    share.pref_amount = share.amount * share.pref_multiple;
    share.pref_effective_multiple = share.pref_multiple;

    // Update the shares array to trigger reactivity
    const updatedShares = [...localPreferenceShares.value];
    localPreferenceShares.value = updatedShares;
};

// Delete share
const deleteShare = (index: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette émission d\'actions de préférence ?')) {
        const updatedShares = [...localPreferenceShares.value];
        updatedShares.splice(index, 1);
        localPreferenceShares.value = updatedShares;
    }
};

// Add a new empty preferred share directly to the table
const addNewShare = () => {
    const newShare: PrefShare = {
        name: '',
        date: new Date(),
        seniority: 1,
        nb_shares: 0,
        share_price: 0,
        amount: 0,
        pref_type: 'NP',
        pref_multiple: 1,
        pref_tri: 0,
        pref_effective_multiple: 1,
        pref_share_price: 0,
        pref_amount: 0
    };

    // Add the new share to the local array
    const updatedShares = [...localPreferenceShares.value, newShare];
    localPreferenceShares.value = updatedShares;
};
</script>