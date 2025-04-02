<template>
    <UCard variant="outline">
        <template #header>
            <span class="text-lg font-semibold mb-4">Historique - Les émissions d'options (BSPCE, BSA)</span>
        </template>

        <div class="relative overflow-auto">
            <table class="min-w-full border-collapse">
                <thead class="top-0 border-b-1 border-t-1 border-gray-200 bg-white">
                    <tr>
                        <th class="px-4 py-3.5 text-xs font-bold text-left">
                            <div class="flex items-center">
                                Intitulé du plan d'options
                                <UButton icon="material-symbols-light:info-outline-rounded" color="neutral"
                                    variant="ghost" class="ml-1" size="xs" aria-label="Info" />
                            </div>
                        </th>
                        <th class="px-4 py-3.5 text-xs font-bold text-left">
                            <div class="flex items-center">
                                Date du plan
                                <UButton icon="material-symbols-light:info-outline-rounded" color="neutral"
                                    variant="ghost" class="ml-1" size="xs" aria-label="Info" />
                            </div>
                        </th>
                        <th class="px-4 py-3.5 text-xs font-bold text-left">
                            <div class="flex items-center">
                                Nombre d'options émises
                                <UButton icon="material-symbols-light:info-outline-rounded" color="neutral"
                                    variant="ghost" class="ml-1" size="xs" aria-label="Info" />
                            </div>
                        </th>
                        <th class="px-4 py-3.5 text-xs font-bold text-left">
                            <div class="flex items-center">
                                Prix d'exercice
                                <UButton icon="material-symbols-light:info-outline-rounded" color="neutral"
                                    variant="ghost" class="ml-1" size="xs" aria-label="Info" />
                            </div>
                        </th>
                        <th class="px-4 py-3.5 text-xs font-bold text-left">
                            <div class="flex items-center">
                                Nombre d'options caduques à ce jour
                                <UButton icon="material-symbols-light:info-outline-rounded" color="neutral"
                                    variant="ghost" class="ml-1" size="xs" aria-label="Info" />
                            </div>
                        </th>
                        <th class="px-4 py-3.5 text-xs font-bold text-left">
                            <div class="flex items-center">
                                Nombre d'options vives
                                <UButton icon="material-symbols-light:info-outline-rounded" color="neutral"
                                    variant="ghost" class="ml-1" size="xs" aria-label="Info" />
                            </div>
                        </th>
                        <th class="px-4 py-3.5 text-xs font-bold" />
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-200 bg-white">
                    <OptionsItem v-for="(option, index) in localOptions" :key="index" :option="option" :index="index"
                        @update="updateOption" @delete="deleteOption" />
                </tbody>
            </table>
        </div>

        <template #footer>
            <div>
                <UButton variant="ghost" icon="i-heroicons-plus" class="text-sm" @click="addNewOption">
                    Ajouter un plan d'options
                </UButton>
            </div>
        </template>
    </UCard>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue';
import type { Option } from '~/types/simulationRequest';
import OptionsItem from './OptionsItem.vue';

// Define component props
const props = defineProps<{
    options: Option[];
}>();

// Define emits
const emit = defineEmits<{
    'update:options': [options: Option[]];
}>();

// Create local reactive copy of props
const localOptions = computed({
    get: () => props.options,
    set: (value) => emit('update:options', value)
});

// Update an option
const updateOption = (index: number, updatedOption: Option) => {
    const updatedOptions = [...localOptions.value];
    updatedOptions[index] = updatedOption;
    localOptions.value = updatedOptions;
};

// Delete option
const deleteOption = (index: number) => {
    const updatedOptions = [...localOptions.value];
    updatedOptions.splice(index, 1);
    localOptions.value = updatedOptions;
};

// Add a new empty option directly to the table
const addNewOption = () => {
    const newOption = {
        name: 'Nouveau plan',
        date: new Date(),
        nb_options: 0,
        strike: 0,
        nb_dead_options: 0,
        nb_alive_options: 0
    };

    // Add the new option to the local array
    const updatedOptions = [...localOptions.value, newOption];
    localOptions.value = updatedOptions;
};
</script>
