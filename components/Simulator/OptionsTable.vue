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
            <div v-if="!isAddingNewOption">
                <UButton variant="ghost" icon="i-heroicons-plus" class="text-sm" @click="startAddOption">
                    Ajouter un plan d'options
                </UButton>
            </div>

            <div v-else class="my-2 p-4 bg-white rounded-lg">
                <h3 class="font-medium mb-3">Nouveau plan d'options</h3>
                <form @submit.prevent="addOption">
                    <div class="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label class="block text-sm mb-1">Intitulé du plan d'options</label>
                            <UInput v-model="newOption.name" class="w-full" required />
                        </div>
                        <div>
                            <label class="block text-sm mb-1">Date du plan</label>
                            <DatePicker v-model="newOption.date" class="w-full" required />
                        </div>
                        <div>
                            <label class="block text-sm mb-1">Nombre d'options émises</label>
                            <UInput v-model.number="newOption.nb_options" class="w-full" type="number" required />
                        </div>
                        <div>
                            <label class="block text-sm mb-1">Prix d'exercice</label>
                            <UInput v-model.number="newOption.strike" class="w-full" type="number" step="0.01"
                                required />
                        </div>
                        <div>
                            <label class="block text-sm mb-1">Nombre d'options caduques à ce jour</label>
                            <UInput v-model.number="newOption.nb_dead_options" class="w-full" type="number" required
                                @update:model-value="updateAliveOptions" />
                        </div>
                    </div>
                    <div class="flex justify-end gap-2">
                        <UButton color="neutral" variant="ghost" type="button" @click="cancelAddOption">Annuler
                        </UButton>
                        <UButton color="primary" type="submit">Ajouter</UButton>
                    </div>
                </form>
            </div>
        </template>
    </UCard>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue';
import type { Options } from '~/types/model';
import OptionsItem from './OptionsItem.vue';

// Define component props
const props = defineProps<{
    options: Options[];
}>();

// Define emits
const emit = defineEmits<{
    'update:options': [options: Options[]];
    'add:option': [option: Options];
}>();

// Create local reactive copy of props
const localOptions = computed({
    get: () => props.options,
    set: (value) => emit('update:options', value)
});

const isAddingNewOption = ref(false);
const newOption = reactive<Options>({
    name: '',
    date: new Date(),
    nb_options: 0,
    strike: 0,
    nb_dead_options: 0,
    nb_alive_options: 0
});

// Update alive options whenever nb_options or nb_dead_options changes
watch([() => newOption.nb_options, () => newOption.nb_dead_options], () => {
    newOption.nb_alive_options = Math.max(0, newOption.nb_options - newOption.nb_dead_options);
});

const updateAliveOptions = () => {
    newOption.nb_alive_options = Math.max(0, newOption.nb_options - newOption.nb_dead_options);
};

// Update an option
const updateOption = (index: number, updatedOption: Options) => {
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

const startAddOption = () => {
    isAddingNewOption.value = true;
    Object.assign(newOption, {
        name: '',
        date: new Date(),
        nb_options: 0,
        strike: 0,
        nb_dead_options: 0,
        nb_alive_options: 0
    });
};

const cancelAddOption = () => {
    isAddingNewOption.value = false;
};

const addOption = () => {
    // Create a new option object (to avoid reference issues)
    const optionToAdd = {
        name: newOption.name,
        date: newOption.date,
        nb_options: newOption.nb_options,
        strike: newOption.strike,
        nb_dead_options: newOption.nb_dead_options,
        nb_alive_options: newOption.nb_alive_options
    };

    console.log('Adding new option:', optionToAdd);

    // Emit the event with the new option
    emit('add:option', optionToAdd);

    // Reset the form
    isAddingNewOption.value = false;
};
</script>
