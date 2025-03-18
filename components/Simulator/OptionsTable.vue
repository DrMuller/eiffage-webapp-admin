<template>
    <UCard variant="outline">
        <template #header>
            <span class="text-lg font-semibold mb-4">Historique - Les émissions d'options (BSPCE, BSA)</span>
        </template>

        <UTable :columns="columns" :data="localOptions" class="w-full" hover>
            <template #name-cell="{ row }">
                <UInput v-if="editingRow === row.index" v-model="editingOption.name" class="w-full" />
                <span v-else>{{ row.original.name }}</span>
            </template>
            <template #date-cell="{ row }">
                <DatePicker v-if="editingRow === row.index" v-model="editingOption.date" class="w-full" />
                <span v-else>{{ row.original.date.toLocaleDateString('fr-FR') }}</span>
            </template>
            <template #nb_options-cell="{ row }">
                <UInput v-if="editingRow === row.index" v-model.number="editingOption.nb_options" class="w-full"
                    type="number" />
                <span v-else>{{ row.original.nb_options }}</span>
            </template>
            <template #strike-cell="{ row }">
                <UInput v-if="editingRow === row.index" v-model.number="editingOption.strike" class="w-full"
                    type="number" step="0.01" />
                <span v-else>{{ row.original.strike.toFixed(2) }} €</span>
            </template>
            <template #nb_dead_options-cell="{ row }">
                <UInput v-if="editingRow === row.index" v-model.number="editingOption.nb_dead_options" class="w-full"
                    type="number" />
                <span v-else>{{ row.original.nb_dead_options }}</span>
            </template>
            <template #actions-cell="{ row }">
                <div v-if="editingRow === row.index" class="flex gap-2">
                    <UButton color="success" variant="ghost" icon="i-heroicons-check" size="sm" aria-label="Save"
                        @click="saveOption()" />
                    <UButton color="neutral" variant="ghost" icon="i-heroicons-x-mark" size="sm" aria-label="Cancel"
                        @click="cancelEdit()" />
                </div>
                <div v-else class="flex justify-end">
                    <UButton color="neutral" variant="ghost" icon="i-heroicons-pencil-square" size="sm"
                        aria-label="Edit" class="text-pink-500" @click="editOption(row.index)" />
                </div>
            </template>
            <template #header-cell="{ column }">
                <div class="flex items-center">
                    {{ column.id ? (column.id === 'actions' ? '' : column.id) : '' }}
                    <UButton v-if="column.id && column.id !== 'actions'" icon="i-heroicons-information-circle"
                        color="neutral" variant="ghost" class="ml-1" size="xs" aria-label="Info" />
                </div>
            </template>
        </UTable>

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
import type { TableColumn } from '@nuxt/ui';


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

const columns: TableColumn<Options>[] = [
    {
        accessorKey: 'name',
        header: 'Intitulé du plan d\'options'
    },
    {
        accessorKey: 'date',
        header: 'Date du plan'
    },
    {
        accessorKey: 'nb_options',
        header: 'Nombre d\'options émises'
    },
    {
        accessorKey: 'strike',
        header: 'Prix d\'exercice'
    },
    {
        accessorKey: 'nb_dead_options',
        header: 'Nombre d\'options caduques à ce jour'
    },
    {
        id: 'actions',
        header: ''
    }
];

const editingRow = ref<number | null>(null);
const editingOption = ref<Options>({
    name: '',
    date: new Date(),
    nb_options: 0,
    strike: 0,
    nb_dead_options: 0,
    nb_alive_options: 0
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

watch([() => editingOption.value.nb_options, () => editingOption.value.nb_dead_options], () => {
    editingOption.value.nb_alive_options = Math.max(0, editingOption.value.nb_options - editingOption.value.nb_dead_options);
});

const updateAliveOptions = () => {
    newOption.nb_alive_options = Math.max(0, newOption.nb_options - newOption.nb_dead_options);
};

// Prefixed with underscore to indicate it's not used in the current UI
const _deleteOption = (index: number) => {
    const updatedOptions = [...localOptions.value];
    updatedOptions.splice(index, 1);
    localOptions.value = updatedOptions;
};

const editOption = (index: number) => {
    editingRow.value = index;
    editingOption.value = { ...localOptions.value[index] };
};

const saveOption = () => {
    if (editingRow.value !== null) {
        const updatedOptions = [...localOptions.value];
        updatedOptions[editingRow.value] = { ...editingOption.value };
        localOptions.value = updatedOptions;
        editingRow.value = null;
    }
};

const cancelEdit = () => {
    editingRow.value = null;
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
