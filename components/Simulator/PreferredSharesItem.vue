<template>
    <tr class="hover:bg-blue-50">
        <td class="p-4 text-xs text-gray-600 whitespace-nowrap">
            <div v-if="isEditing">
                <UInput v-model="editedShare.name" class="w-full"
                    :ui="{ base: showNameError ? 'ring-red-500 border-red-500' : '' }" required
                    @focus="showNameError = false" />
            </div>
            <div v-else>
                {{ share.name }}
            </div>
        </td>
        <td class="p-4 text-xs text-gray-600 whitespace-nowrap">
            <div v-if="isEditing">
                <DatePicker v-model="editedShare.date" class="w-full" />
            </div>
            <div v-else>
                {{ share.date.toLocaleDateString('fr-FR') }}
            </div>
        </td>
        <td class="p-4 text-xs text-gray-600 whitespace-nowrap">
            <div v-if="isEditing">
                <UInput v-model.number="editedShare.seniority" class="w-full" type="number" min="1"
                    :ui="{ base: showRankError ? 'ring-red-500 border-red-500' : '' }" required
                    @focus="showRankError = false" />
            </div>
            <div v-else>
                {{ share.seniority }}
            </div>
        </td>
        <td class="p-4 text-xs text-gray-600 whitespace-nowrap">
            <div v-if="isEditing">
                <UInput v-model.number="editedShare.nb_shares" class="w-full" type="number"
                    :ui="{ base: showSharesError ? 'ring-red-500 border-red-500' : '' }" required
                    @focus="showSharesError = false" @update:model-value="updateAmount" />
            </div>
            <div v-else>
                {{ formattedNbShares }}
            </div>
        </td>
        <td class="p-4 text-xs text-gray-600 whitespace-nowrap">
            <div v-if="isEditing">
                <UInput v-model.number="editedShare.share_price" class="w-full" type="number" step="0.01"
                    :ui="{ base: showPriceError ? 'ring-red-500 border-red-500' : '' }" required
                    @focus="showPriceError = false" @update:model-value="updateAmount" />
            </div>
            <div v-else>
                {{ formattedSharePrice }}
            </div>
        </td>
        <td class="p-4 text-xs text-gray-600 whitespace-nowrap">
            <div v-if="isEditing">
                <USelect v-model="editedShare.pref_type" class="w-full" :items="[{
                    label: 'Participating',
                    value: 'P'
                }, {
                    label: 'Non participating',
                    value: 'NP'
                }]" :ui="{ base: showParticipationError ? 'ring-red-500 border-red-500' : '' }" required
                    @focus="showParticipationError = false" />
            </div>
            <div v-else>
                {{ share.pref_type === 'P' ? 'Participating' : 'Non participating' }}
            </div>
        </td>
        <td class="p-4 text-xs text-gray-600 whitespace-nowrap">
            <div v-if="isEditing">
                <UInput v-model.number="editedShare.pref_multiple" class="w-full" type="number" step="0.1" min="1"
                    :ui="{ base: showMultipleError ? 'ring-red-500 border-red-500' : '' }" required
                    @focus="showMultipleError = false" @update:model-value="updateAmount" />
            </div>
            <div v-else>
                {{ formattedPrefMultiple }}
            </div>
        </td>
        <td class="p-4 text-xs text-gray-600 whitespace-nowrap">
            <div v-if="isEditing">
                <UInput v-model.number="editedShare.pref_tri" class="w-full" type="number"
                    :ui="{ base: showTriError ? 'ring-red-500 border-red-500' : '' }" required
                    @focus="showTriError = false" />
            </div>
            <div v-else>
                {{ formattedPrefTri }}
            </div>
        </td>
        <td class="p-4 text-xs text-gray-600 whitespace-nowrap">
            <div v-if="isEditing" class="flex justify-end">
                <UButton color="success" variant="ghost" icon="material-symbols-light:check-rounded" size="sm"
                    aria-label="Save" @click="saveEdit" />
                <UButton color="neutral" variant="ghost" icon="material-symbols-light:close-rounded" size="sm"
                    aria-label="Cancel" @click="cancelEdit" />
            </div>
            <div v-else class="flex justify-end">
                <UButton color="info" variant="ghost" icon="material-symbols-light:edit-square-outline-rounded"
                    size="sm" aria-label="Edit" @click="startEdit" />
                <UButton color="error" variant="ghost" icon="material-symbols-light:delete-outline-rounded" size="sm"
                    aria-label="Delete" @click="confirmDelete" />
            </div>
        </td>
    </tr>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import type { PrefShare } from '~/types/simulationRequest';

const props = defineProps<{
    share: PrefShare;
    index: number;
}>();

const emit = defineEmits<{
    'update': [index: number, share: PrefShare];
    'delete': [index: number];
}>();

const isEditing = ref(false);
const showNameError = ref(false);
const showRankError = ref(false);
const showSharesError = ref(false);
const showPriceError = ref(false);
const showParticipationError = ref(false);
const showMultipleError = ref(false);
const showTriError = ref(false);

const editedShare = reactive<PrefShare>({
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
});

// Computed properties for formatting
const formattedNbShares = computed(() => {
    return props.share.nb_shares.toLocaleString('fr-FR');
});

const formattedSharePrice = computed(() => {
    return `${props.share.share_price.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 6 })} €`;
});

const formattedPrefMultiple = computed(() => {
    return props.share.pref_multiple.toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
});

const formattedPrefTri = computed(() => {
    return `${props.share.pref_tri.toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} %`;
});

// Function to start editing
const startEdit = () => {
    // Clone the share to avoid directly mutating props
    Object.assign(editedShare, { ...props.share });
    isEditing.value = true;

    // Reset error states
    showNameError.value = false;
    showRankError.value = false;
    showSharesError.value = false;
    showPriceError.value = false;
    showParticipationError.value = false;
    showMultipleError.value = false;
    showTriError.value = false;
};

// Function to update amount and preference-related values
const updateAmount = () => {
    editedShare.amount = editedShare.nb_shares * editedShare.share_price;
    editedShare.pref_share_price = editedShare.share_price;
    editedShare.pref_amount = editedShare.amount * editedShare.pref_multiple;
    editedShare.pref_effective_multiple = editedShare.pref_multiple; // This might need a different calculation
};

// Function to save changes
const saveEdit = () => {
    let hasError = false;

    // Validate required fields
    if (!editedShare.name) {
        showNameError.value = true;
        hasError = true;
    }

    if (!editedShare.seniority || editedShare.seniority < 1) {
        showRankError.value = true;
        hasError = true;
    }

    if (!editedShare.nb_shares || editedShare.nb_shares <= 0) {
        showSharesError.value = true;
        hasError = true;
    }

    if (!editedShare.share_price || editedShare.share_price <= 0) {
        showPriceError.value = true;
        hasError = true;
    }

    if (!editedShare.pref_type) {
        showParticipationError.value = true;
        hasError = true;
    }

    if (!editedShare.pref_multiple || editedShare.pref_multiple < 1) {
        showMultipleError.value = true;
        hasError = true;
    }

    if (editedShare.pref_tri === undefined || editedShare.pref_tri === null) {
        showTriError.value = true;
        hasError = true;
    }

    if (hasError) {
        return;
    }

    // Ensure all calculated values are up to date
    updateAmount();

    emit('update', props.index, { ...editedShare });
    isEditing.value = false;
};

// Function to cancel editing
const cancelEdit = () => {
    isEditing.value = false;

    // Reset error states
    showNameError.value = false;
    showRankError.value = false;
    showSharesError.value = false;
    showPriceError.value = false;
    showParticipationError.value = false;
    showMultipleError.value = false;
    showTriError.value = false;
};

// Function to confirm and delete
const confirmDelete = () => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette émission d\'actions de préférence ?')) {
        emit('delete', props.index);
    }
};

</script>