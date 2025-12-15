<template>
    <div class="p-6">
        <div class="mb-6 flex items-center justify-between">
            <div>
                <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Gestion des Campagnes</h1>
                <p class="text-gray-600 dark:text-gray-400 mt-2">Créer, modifier et supprimer des campagnes d'évaluation
                </p>
            </div>
            <div class="flex items-center gap-2">
                <UButton color="secondary" icon="i-heroicons-plus" @click="openCreateModal">Nouvelle campagne</UButton>
            </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="flex justify-center items-center py-12">
            <UIcon name="i-heroicons-arrow-path" class="animate-spin w-6 h-6" />
            <span class="ml-2">Chargement des Campagnes...</span>
        </div>

        <!-- Error State -->
        <UAlert v-else-if="error" icon="i-heroicons-exclamation-triangle" color="error" variant="soft"
            title="Erreur lors du chargement des Campagnes" :description="error" class="mb-6" />

        <!-- Table -->
        <UCard v-else variant="outline">
            <template #header>
                <div class="flex items-center gap-3">
                    <span class="text-lg font-semibold">Liste des Campagnes</span>
                    <UBadge color="info" variant="soft">{{ campaigns.length }}</UBadge>
                </div>
            </template>

            <UTable :data="campaigns" :columns="columns" sticky>
                <template #startDate-cell="{ row }">
                    <span class="text-gray-900 dark:text-white">{{ useFormatDate(row.original.startDate) }}</span>
                </template>
                <template #endDate-cell="{ row }">
                    <span class="text-gray-900 dark:text-white">{{ useFormatDate(row.original.endDate) }}</span>
                </template>
                <template #createdAt-cell="{ row }">
                    <span class="text-gray-500 dark:text-gray-400">{{ useFormatDate(row.original.createdAt) }}</span>
                </template>
                <template #actions-cell="{ row }">
                    <div class="flex justify-end gap-2">
                        <UButton size="sm" color="neutral" variant="ghost" icon="i-heroicons-pencil-square"
                            @click="openEditModal(row.original)">
                            Modifier
                        </UButton>
                        <UButton size="sm" color="error" variant="ghost" icon="i-heroicons-trash"
                            @click="confirmDelete(row.original)">
                            Supprimer
                        </UButton>
                    </div>
                </template>
            </UTable>

            <div v-if="campaigns.length === 0 && !loading && !error" class="text-center py-12">
                <UIcon name="i-heroicons-calendar" class="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">Aucune Campagne trouvée</h3>
                <p class="text-gray-600 dark:text-gray-400">Créez votre première campagne pour commencer.</p>
            </div>
        </UCard>

        <!-- Create / Edit Modal -->
        <UModal v-model:open="isModalOpen" :title="modalTitle">
            <template #body>
                <div class="p-6">
                    <form class="space-y-4" @submit.prevent="handleSubmit">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <UFormField label="Date de début" required>
                                    <UInput v-model="form.startDate" type="date" />
                                </UFormField>
                            </div>
                            <div>
                                <UFormField label="Date de fin" required>
                                    <UInput v-model="form.endDate" type="date" />
                                </UFormField>
                            </div>
                        </div>
                        <div class="flex justify-end gap-2 pt-4">
                            <UButton color="neutral" variant="soft" @click="isModalOpen = false">Annuler</UButton>
                            <UButton type="submit" color="secondary" :loading="loading">Enregistrer</UButton>
                        </div>
                    </form>
                </div>
            </template>
        </UModal>

        <!-- Delete confirm -->
        <UModal v-model:open="isDeleteOpen" title="Supprimer la campagne ?">
            <template #body>
                <div class="p-6">
                    <p class="mb-4">Cette action est irréversible. Confirmer la suppression ?</p>
                    <div class="flex justify-end gap-2">
                        <UButton color="neutral" variant="soft" @click="isDeleteOpen = false">Annuler</UButton>
                        <UButton color="error" :loading="loading" @click="handleDelete">Supprimer</UButton>
                    </div>
                </div>
            </template>
        </UModal>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import type { EvaluationCampaign } from '~/types/evaluationCampaign'
import { useFormatDate } from '~/composables/useFormatter'

definePageMeta({
    middleware: ['auth', 'admin'],
    layout: 'default'
})

const { campaigns, loading, error, getAll, create, update, remove } = useEvaluationCampaigns()

const toast = useToast()

const isModalOpen = ref(false)
const isDeleteOpen = ref(false)
const editing = ref<EvaluationCampaign | null>(null)
const toDelete = ref<EvaluationCampaign | null>(null)

const form = ref<{ startDate: string; endDate: string }>({ startDate: '', endDate: '' })

const columns = computed<TableColumn<EvaluationCampaign>[]>(() => [
    { accessorKey: 'startDate', header: 'Début', meta: { class: { th: 'text-left' } } },
    { accessorKey: 'endDate', header: 'Fin', meta: { class: { th: 'text-left' } } },
    { accessorKey: 'createdAt', header: 'Créée le', meta: { class: { th: 'text-left' } } },
    { id: 'actions', header: '', meta: { class: { th: 'w-[180px] text-right', td: 'w-[180px]' } } },
])

const modalTitle = computed(() => (editing.value ? 'Modifier la campagne' : 'Nouvelle campagne'))

function openCreateModal() {
    editing.value = null
    form.value = { startDate: '', endDate: '' }
    isModalOpen.value = true
}

function openEditModal(c: EvaluationCampaign) {
    editing.value = c
    // Ensure ISO yyyy-mm-dd values for input date fields
    const s = new Date(c.startDate)
    const e = new Date(c.endDate)
    form.value = {
        startDate: s.toISOString().slice(0, 10),
        endDate: e.toISOString().slice(0, 10)
    }
    isModalOpen.value = true
}

function confirmDelete(c: EvaluationCampaign) {
    toDelete.value = c
    isDeleteOpen.value = true
}

async function handleSubmit() {
    if (!form.value.startDate || !form.value.endDate) return
    const start = new Date(form.value.startDate)
    const end = new Date(form.value.endDate)
    if (end < start) {
        toast.add({ title: 'Dates invalides', description: 'La date de fin doit être après la date de début', color: 'error' })
        return
    }

    try {
        if (editing.value) {
            await update(editing.value._id, { startDate: start, endDate: end })
            toast.add({ title: 'Campagne mise à jour', color: 'success' })
        } else {
            await create({ startDate: start, endDate: end })
            toast.add({ title: 'Campagne créée', color: 'success' })
        }
        isModalOpen.value = false
    } catch (err) {
        toast.add({ title: 'Erreur', description: 'Opération échouée', color: 'error' })
        console.error(err)
    }
}

async function handleDelete() {
    if (!toDelete.value) return
    try {
        await remove(toDelete.value._id)
        toast.add({ title: 'Campagne supprimée', color: 'success' })
        isDeleteOpen.value = false
        toDelete.value = null
    } catch {
        toast.add({ title: 'Erreur', description: 'Suppression échouée', color: 'error' })
    }
}


onMounted(async () => {
    await getAll()
})

useHead({ title: 'Gestion des Campagnes - Eiffage' })
</script>
