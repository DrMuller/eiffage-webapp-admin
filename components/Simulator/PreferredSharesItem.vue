<template>
    <tr class="hover:bg-blue-50">
        <td class="p-4 text-xs text-gray-600 whitespace-nowrap">
            <div v-if="isEditing">
                <UInput v-model="editedShare.title" class="w-full"
                    :ui="{ base: showTitleError ? 'ring-red-500 border-red-500' : '' }" required
                    @focus="showTitleError = false" />
            </div>
            <div v-else>
                {{ share.title }}
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
                <UInput v-model.number="editedShare.liquidationRank" class="w-full" type="number" min="1"
                    :ui="{ base: showRankError ? 'ring-red-500 border-red-500' : '' }" required
                    @focus="showRankError = false" />
            </div>
            <div v-else>
                {{ share.liquidationRank }}
            </div>
        </td>
        <td class="p-4 text-xs text-gray-600 whitespace-nowrap">
            <div v-if="isEditing">
                <UInput v-model.number="editedShare.shares" class="w-full" type="number"
                    :ui="{ base: showSharesError ? 'ring-red-500 border-red-500' : '' }" required
                    @focus="showSharesError = false" />
            </div>
            <div v-else>
                {{ share.shares }}
            </div>
        </td>
        <td class="p-4 text-xs text-gray-600 whitespace-nowrap">
            <div v-if="isEditing">
                <UInput v-model.number="editedShare.price" class="w-full" type="number" step="0.01"
                    :ui="{ base: showPriceError ? 'ring-red-500 border-red-500' : '' }" required
                    @focus="showPriceError = false" />
            </div>
            <div v-else>
                {{ share.price.toFixed(2) }} €
            </div>
        </td>
        <td class="p-4 text-xs text-gray-600 whitespace-nowrap">
            <div v-if="isEditing">
                <USelect v-model="editedShare.participationType" class="w-full"
                    :options="['Participating', 'Non participating']"
                    :ui="{ base: showParticipationError ? 'ring-red-500 border-red-500' : '' }" required
                    @focus="showParticipationError = false" />
            </div>
            <div v-else>
                {{ share.participationType }}
            </div>
        </td>
        <td class="p-4 text-xs text-gray-600 whitespace-nowrap">
            <div v-if="isEditing">
                <UInput v-model.number="editedShare.multiple" class="w-full" type="number" step="0.1" min="1"
                    :ui="{ base: showMultipleError ? 'ring-red-500 border-red-500' : '' }" required
                    @focus="showMultipleError = false" />
            </div>
            <div v-else>
                {{ share.multiple }}
            </div>
        </td>
        <td class="p-4 text-xs text-gray-600 whitespace-nowrap">
            <div v-if="isEditing">
                <UInput v-model.number="editedShare.tri" class="w-full" type="number"
                    :ui="{ base: showTriError ? 'ring-red-500 border-red-500' : '' }" required
                    @focus="showTriError = false" />
            </div>
            <div v-else>
                {{ share.tri }} %
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
import { ref, reactive } from 'vue';

// Define interface for preferred share
interface PreferenceShare {
    title: string;
    date: Date;
    liquidationRank: number;
    shares: number;
    price: number;
    participationType: string;
    multiple: number;
    tri: number;
}

const props = defineProps<{
    share: PreferenceShare;
    index: number;
}>();

const emit = defineEmits<{
    'update': [index: number, share: PreferenceShare];
    'delete': [index: number];
}>();

const isEditing = ref(false);
const showTitleError = ref(false);
const showRankError = ref(false);
const showSharesError = ref(false);
const showPriceError = ref(false);
const showParticipationError = ref(false);
const showMultipleError = ref(false);
const showTriError = ref(false);

const editedShare = reactive<PreferenceShare>({
    title: '',
    date: new Date(),
    liquidationRank: 1,
    shares: 0,
    price: 0,
    participationType: 'Non participating',
    multiple: 1,
    tri: 0
});

// Function to start editing
const startEdit = () => {
    // Clone the share to avoid directly mutating props
    Object.assign(editedShare, { ...props.share });
    isEditing.value = true;

    // Reset error states
    showTitleError.value = false;
    showRankError.value = false;
    showSharesError.value = false;
    showPriceError.value = false;
    showParticipationError.value = false;
    showMultipleError.value = false;
    showTriError.value = false;
};

// Function to save changes
const saveEdit = () => {
    let hasError = false;

    // Validate required fields
    if (!editedShare.title) {
        showTitleError.value = true;
        hasError = true;
    }

    if (!editedShare.liquidationRank || editedShare.liquidationRank < 1) {
        showRankError.value = true;
        hasError = true;
    }

    if (!editedShare.shares || editedShare.shares <= 0) {
        showSharesError.value = true;
        hasError = true;
    }

    if (!editedShare.price || editedShare.price <= 0) {
        showPriceError.value = true;
        hasError = true;
    }

    if (!editedShare.participationType) {
        showParticipationError.value = true;
        hasError = true;
    }

    if (!editedShare.multiple || editedShare.multiple < 1) {
        showMultipleError.value = true;
        hasError = true;
    }

    if (editedShare.tri === undefined || editedShare.tri === null) {
        showTriError.value = true;
        hasError = true;
    }

    if (hasError) {
        return;
    }

    emit('update', props.index, { ...editedShare });
    isEditing.value = false;
};

// Function to cancel editing
const cancelEdit = () => {
    isEditing.value = false;

    // Reset error states
    showTitleError.value = false;
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