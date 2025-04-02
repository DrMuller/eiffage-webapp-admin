<template>
    <tr class="hover:bg-blue-50">
        <td class="p-4 text-xs text-gray-600 whitespace-nowrap">
            <UInput v-model="editedShare.name" class="w-full" required />
        </td>
        <td class="p-4 text-xs text-gray-600 whitespace-nowrap">
            <DatePicker v-model="editedShare.date" class="w-full" required />
        </td>
        <td class="p-4 text-xs text-gray-600 whitespace-nowrap">
            <UInput v-model.number="editedShare.seniority" class="w-full" type="number" min="1" required />
        </td>
        <td class="p-4 text-xs text-gray-600 whitespace-nowrap">
            <UInput v-model.number="editedShare.nb_shares" class="w-full" type="number" min="0" required
                @update:model-value="updateAmount" />
        </td>
        <td class="p-4 text-xs text-gray-600 whitespace-nowrap">
            <UInput v-model.number="editedShare.share_price" class="w-full" type="number" step="0.01" min="0" required
                @update:model-value="updateAmount" />
        </td>
        <td class="p-4 text-xs text-gray-600 whitespace-nowrap">
            <USelect v-model="editedShare.pref_type" class="w-full" :items="[{
                label: 'Participating',
                value: 'P'
            }, {
                label: 'Non participating',
                value: 'NP'
            }]" required />
        </td>
        <td class="p-4 text-xs text-gray-600 whitespace-nowrap">
            <UInput v-model.number="editedShare.pref_multiple" class="w-full" type="number" step="0.1" min="1" required
                @update:model-value="updateAmount" />
        </td>
        <td class="p-4 text-xs text-gray-600 whitespace-nowrap">
            <UInput v-model.number="editedShare.pref_tri" class="w-full" type="number" min="0" required />
        </td>
        <td class="p-4 text-xs text-gray-600 whitespace-nowrap">
            <div class="flex justify-end">
                <UButton type="button" color="error" variant="ghost"
                    icon="material-symbols-light:delete-outline-rounded" size="sm" aria-label="Delete"
                    @click="confirmDelete" />
            </div>
        </td>
    </tr>
</template>

<script setup lang="ts">
import { reactive, onMounted, watch } from 'vue';
import type { PrefShare } from '~/types/simulationRequest';

const props = defineProps<{
    share: PrefShare;
    index: number;
}>();

const emit = defineEmits<{
    'update': [index: number, share: PrefShare];
    'delete': [index: number];
}>();

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
    updateAmount();
    emit('update', props.index, { ...editedShare });
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