<template>
    <tr class="hover:bg-blue-50">
        <td class="p-4 text-xs text-gray-600 whitespace-nowrap">
            <UInput v-model="editedShare.name" class="w-full"
                :ui="{ base: showNameError ? 'ring-red-500 border-red-500' : '' }" required
                @focus="showNameError = false" />
        </td>
        <td class="p-4 text-xs text-gray-600 whitespace-nowrap">
            <DatePicker v-model="editedShare.date" class="w-full" />
        </td>
        <td class="p-4 text-xs text-gray-600 whitespace-nowrap">
            <UInput v-model.number="editedShare.seniority" class="w-full" type="number" min="1"
                :ui="{ base: showRankError ? 'ring-red-500 border-red-500' : '' }" required
                @focus="showRankError = false" />
        </td>
        <td class="p-4 text-xs text-gray-600 whitespace-nowrap">
            <UInput v-model.number="editedShare.nb_shares" class="w-full" type="number"
                :ui="{ base: showSharesError ? 'ring-red-500 border-red-500' : '' }" required
                @focus="showSharesError = false" @update:model-value="updateAmount" />
        </td>
        <td class="p-4 text-xs text-gray-600 whitespace-nowrap">
            <UInput v-model.number="editedShare.share_price" class="w-full" type="number" step="0.01"
                :ui="{ base: showPriceError ? 'ring-red-500 border-red-500' : '' }" required
                @focus="showPriceError = false" @update:model-value="updateAmount" />
        </td>
        <td class="p-4 text-xs text-gray-600 whitespace-nowrap">
            <USelect v-model="editedShare.pref_type" class="w-full" :items="[{
                label: 'Participating',
                value: 'P'
            }, {
                label: 'Non participating',
                value: 'NP'
            }]" :ui="{ base: showParticipationError ? 'ring-red-500 border-red-500' : '' }" required
                @focus="showParticipationError = false" />
        </td>
        <td class="p-4 text-xs text-gray-600 whitespace-nowrap">
            <UInput v-model.number="editedShare.pref_multiple" class="w-full" type="number" step="0.1" min="1"
                :ui="{ base: showMultipleError ? 'ring-red-500 border-red-500' : '' }" required
                @focus="showMultipleError = false" @update:model-value="updateAmount" />
        </td>
        <td class="p-4 text-xs text-gray-600 whitespace-nowrap">
            <UInput v-model.number="editedShare.pref_tri" class="w-full" type="number"
                :ui="{ base: showTriError ? 'ring-red-500 border-red-500' : '' }" required
                @focus="showTriError = false" />
        </td>
        <td class="p-4 text-xs text-gray-600 whitespace-nowrap">
            <div class="flex justify-end">
                <UButton color="error" variant="ghost" icon="material-symbols-light:delete-outline-rounded" size="sm"
                    aria-label="Delete" @click="confirmDelete" />
            </div>
        </td>
    </tr>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue';
import type { PrefShare } from '~/types/simulationRequest';

const props = defineProps<{
    share: PrefShare;
    index: number;
}>();

const emit = defineEmits<{
    'update': [index: number, share: PrefShare];
    'delete': [index: number];
}>();

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

// Initialize with props data on mount
onMounted(() => {
    Object.assign(editedShare, { ...props.share });
});

// Watch for prop changes and update the edited share
watch(() => props.share, (newShare) => {
    Object.assign(editedShare, { ...newShare });
}, { deep: true });

// Watch for changes in edited share and emit updates
watch(editedShare, () => {
    // Validate before emitting
    if (editedShare.name &&
        editedShare.seniority >= 1 &&
        editedShare.nb_shares > 0 &&
        editedShare.share_price > 0 &&
        editedShare.pref_type &&
        editedShare.pref_multiple >= 1 &&
        editedShare.pref_tri !== undefined) {
        updateAmount();
        emit('update', props.index, { ...editedShare });
    }
}, { deep: true });

// Function to update amount and preference-related values
const updateAmount = () => {
    editedShare.amount = editedShare.nb_shares * editedShare.share_price;
    editedShare.pref_share_price = editedShare.share_price;
    editedShare.pref_amount = editedShare.amount * editedShare.pref_multiple;
    editedShare.pref_effective_multiple = editedShare.pref_multiple; // This might need a different calculation
};

// Function to confirm and delete
const confirmDelete = () => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette émission d\'actions de préférence ?')) {
        emit('delete', props.index);
    }
};
</script>