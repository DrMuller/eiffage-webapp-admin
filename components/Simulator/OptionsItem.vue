<template>
    <tr class="hover:bg-blue-50">
        <td class="p-4 text-xs text-gray-600 whitespace-nowrap">
            <div v-if="isEditing">
                <UInput v-model="editedOption.name" class="w-full"
                    :ui="{ base: showNameError ? 'ring-red-500 border-red-500' : '' }" required
                    @focus="showNameError = false" />
            </div>
            <div v-else>
                {{ option.name }}
            </div>
        </td>
        <td class="p-4 text-xs text-gray-600 whitespace-nowrap">
            <div v-if="isEditing">
                <DatePicker v-model="editedOption.date" class="w-full" />
            </div>
            <div v-else>
                {{ option.date.toLocaleDateString('fr-FR') }}
            </div>
        </td>
        <td class="p-4 text-xs text-gray-600 whitespace-nowrap">
            <div v-if="isEditing">
                <UInput v-model.number="editedOption.nb_options" class="w-full" type="number"
                    :ui="{ base: showOptionsError ? 'ring-red-500 border-red-500' : '' }" required
                    @focus="showOptionsError = false" @update:model-value="updateAliveOptions" />
            </div>
            <div v-else>
                {{ option.nb_options }}
            </div>
        </td>
        <td class="p-4 text-xs text-gray-600 whitespace-nowrap">
            <div v-if="isEditing">
                <UInput v-model.number="editedOption.strike" class="w-full" type="number" step="0.01"
                    :ui="{ base: showStrikeError ? 'ring-red-500 border-red-500' : '' }" required
                    @focus="showStrikeError = false" />
            </div>
            <div v-else>
                {{ option.strike.toFixed(2) }} €
            </div>
        </td>
        <td class="p-4 text-xs text-gray-600 whitespace-nowrap">
            <div v-if="isEditing">
                <UInput v-model.number="editedOption.nb_dead_options" class="w-full" type="number"
                    :ui="{ base: showDeadOptionsError ? 'ring-red-500 border-red-500' : '' }" required
                    @focus="showDeadOptionsError = false" @update:model-value="updateAliveOptions" />
            </div>
            <div v-else>
                {{ option.nb_dead_options }}
            </div>
        </td>
        <td class="p-4 text-xs text-gray-600 whitespace-nowrap">
            <div v-if="isEditing">
                {{ editedOption.nb_alive_options }}
            </div>
            <div v-else>
                {{ option.nb_alive_options }}
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
import type { Options } from '~/types/model';

const props = defineProps<{
    option: Options;
    index: number;
}>();

const emit = defineEmits<{
    'update': [index: number, option: Options];
    'delete': [index: number];
}>();

const isEditing = ref(false);
const showNameError = ref(false);
const showOptionsError = ref(false);
const showStrikeError = ref(false);
const showDeadOptionsError = ref(false);

const editedOption = reactive<Options>({
    name: '',
    date: new Date(),
    nb_options: 0,
    strike: 0,
    nb_dead_options: 0,
    nb_alive_options: 0
});

// Function to start editing
const startEdit = () => {
    // Clone the option to avoid directly mutating props
    Object.assign(editedOption, { ...props.option });
    isEditing.value = true;

    // Reset error states
    showNameError.value = false;
    showOptionsError.value = false;
    showStrikeError.value = false;
    showDeadOptionsError.value = false;
};

// Function to save changes
const saveEdit = () => {
    let hasError = false;

    // Validate required fields
    if (!editedOption.name) {
        showNameError.value = true;
        hasError = true;
    }

    if (!editedOption.nb_options || editedOption.nb_options <= 0) {
        showOptionsError.value = true;
        hasError = true;
    }

    if (!editedOption.strike || editedOption.strike <= 0) {
        showStrikeError.value = true;
        hasError = true;
    }

    if (editedOption.nb_dead_options === undefined || editedOption.nb_dead_options === null) {
        showDeadOptionsError.value = true;
        hasError = true;
    }

    // If there's a validation error, don't proceed
    if (hasError) {
        return;
    }

    // Ensure alive options is calculated before saving
    updateAliveOptions();

    emit('update', props.index, { ...editedOption });
    isEditing.value = false;
};

// Function to cancel editing
const cancelEdit = () => {
    isEditing.value = false;

    // Reset error states
    showNameError.value = false;
    showOptionsError.value = false;
    showStrikeError.value = false;
    showDeadOptionsError.value = false;
};

// Function to update alive options when options or dead options change
const updateAliveOptions = () => {
    editedOption.nb_alive_options = Math.max(0, editedOption.nb_options - editedOption.nb_dead_options);
};

// Function to confirm and delete
const confirmDelete = () => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce plan d\'options ?')) {
        emit('delete', props.index);
    }
};
</script>