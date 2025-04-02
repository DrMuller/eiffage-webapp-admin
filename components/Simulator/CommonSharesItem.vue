<template>
    <tr class="hover:bg-blue-50">
        <td class="p-4 text-xs text-gray-600 whitespace-nowrap">
            <UInput v-model="editedShare.name" class="w-full" required />
        </td>
        <td class="p-4 text-xs text-gray-600 whitespace-nowrap">
            <DatePicker v-model="editedShare.date" class="w-full" required />
        </td>
        <td class="p-4 text-xs text-gray-600 whitespace-nowrap">
            <UInput v-model.number="editedShare.nb_shares" class="w-full" type="number" min="0" required
                @update:model-value="updateAmount" />
        </td>
        <td class="p-4 text-xs text-gray-600 whitespace-nowrap">
            <UInput v-model.number="editedShare.share_price" class="w-full" type="number" step="0.000001" min="0"
                required @update:model-value="updateAmount" />
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
import type { CommonShare } from '~/types/simulationRequest';

const props = defineProps<{
    share: CommonShare;
    index: number;
}>();

const emit = defineEmits<{
    'update': [index: number, share: CommonShare];
    'delete': [index: number];
}>();

const editedShare = reactive<CommonShare>({
    name: '',
    date: new Date(),
    nb_shares: 0,
    share_price: 0,
    amount: 0
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

// Function to update amount when shares or price change
const updateAmount = () => {
    editedShare.amount = editedShare.nb_shares * editedShare.share_price;
};

// Function to confirm and delete
const confirmDelete = () => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette émission d\'actions ?')) {
        emit('delete', props.index);
    }
};
</script>