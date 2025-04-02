<template>
    <tr class="hover:bg-blue-50">
        <td class="p-4 text-xs text-gray-600 whitespace-nowrap">
            <UInput v-model="editedOption.name" class="w-full"
                :ui="{ base: showNameError ? 'ring-red-500 border-red-500' : '' }" required
                @focus="showNameError = false" />
        </td>
        <td class="p-4 text-xs text-gray-600 whitespace-nowrap">
            <DatePicker v-model="editedOption.date" class="w-full" />
        </td>
        <td class="p-4 text-xs text-gray-600 whitespace-nowrap">
            <UInput v-model.number="editedOption.nb_options" class="w-full" type="number"
                :ui="{ base: showOptionsError ? 'ring-red-500 border-red-500' : '' }" required
                @focus="showOptionsError = false" @update:model-value="updateAliveOptions" />
        </td>
        <td class="p-4 text-xs text-gray-600 whitespace-nowrap">
            <UInput v-model.number="editedOption.strike" class="w-full" type="number" step="0.01"
                :ui="{ base: showStrikeError ? 'ring-red-500 border-red-500' : '' }" required
                @focus="showStrikeError = false" />
        </td>
        <td class="p-4 text-xs text-gray-600 whitespace-nowrap">
            <UInput v-model.number="editedOption.nb_dead_options" class="w-full" type="number"
                :ui="{ base: showDeadOptionsError ? 'ring-red-500 border-red-500' : '' }" required
                @focus="showDeadOptionsError = false" @update:model-value="updateAliveOptions" />
        </td>
        <td class="p-4 text-xs text-gray-600 whitespace-nowrap">
            {{ editedOption.nb_alive_options }}
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
import type { Option } from '~/types/simulationRequest';

const props = defineProps<{
    option: Option;
    index: number;
}>();

const emit = defineEmits<{
    'update': [index: number, option: Option];
    'delete': [index: number];
}>();

const showNameError = ref(false);
const showOptionsError = ref(false);
const showStrikeError = ref(false);
const showDeadOptionsError = ref(false);

const editedOption = reactive<Option>({
    name: '',
    date: new Date(),
    nb_options: 0,
    strike: 0,
    nb_dead_options: 0,
    nb_alive_options: 0
});

// Initialize with props data on mount
onMounted(() => {
    Object.assign(editedOption, { ...props.option });
});

// Watch for prop changes and update the edited option
watch(() => props.option, (newOption) => {
    Object.assign(editedOption, { ...newOption });
}, { deep: true });

// Watch for changes in edited option and emit updates
watch(editedOption, () => {
    // Validate before emitting
    if (editedOption.name &&
        editedOption.nb_options > 0 &&
        editedOption.strike > 0 &&
        editedOption.nb_dead_options !== undefined) {
        updateAliveOptions();
        emit('update', props.index, { ...editedOption });
    }
}, { deep: true });

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