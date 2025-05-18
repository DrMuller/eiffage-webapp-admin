<template>
    <div class="organisation-page p-6">
        <div class="flex justify-between items-center mb-8">
            <h1 class="text-2xl font-bold">Réglages</h1>
        </div>

        <h2 class="text-xl font-semibold mb-6">Général</h2>

        <div class="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <!-- Logo -->
            <div class="flex justify-between items-center p-6 border-b border-gray-200">
                <div class="text-base font-medium">Logo</div>
                <div class="flex items-center">
                    <div
                        class="w-16 h-16 flex items-center justify-center bg-gray-100 rounded-md border border-gray-200 overflow-hidden">
                        <img v-if="currentOrganisation?.logoUrl" :src="currentOrganisation.logoUrl"
                            :alt="currentOrganisation?.name" class="w-full h-full object-cover">
                        <UIcon v-else name="i-heroicons-building-office" class="w-8 h-8 text-gray-500" />
                    </div>
                </div>
            </div>

            <!-- Nom -->
            <div class="flex justify-between items-center p-6 border-b border-gray-200">
                <div class="text-base font-medium">Nom</div>
                <div>{{ currentOrganisation?.name || 'Non renseigné' }}</div>
            </div>

            <!-- Adresse -->
            <div class="flex justify-between items-center p-6 border-b border-gray-200">
                <div class="text-base font-medium">Adresse</div>
                <div>{{ currentOrganisation?.address || 'Non renseigné' }}</div>
            </div>

            <!-- SIREN -->
            <div class="flex justify-between items-center p-6">
                <div class="text-base font-medium">SIREN</div>
                <div>{{ currentOrganisation?.siren || 'Non renseigné' }}</div>
            </div>
        </div>
        <!-- Edit Organization Modal -->
        <UModal title="Modifier les informations de l'organisation" v-model:open="isModalOpen">
            <div class="mt-6 flex justify-end">
                <UButton color="primary" @click="openEditModal">Modifier les informations</UButton>
            </div>

            <template #body>
                <form @submit.prevent="saveOrganisation">
                    <div class="space-y-4 p-2">
                        <!-- Logo Upload -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Logo</label>
                            <div class="flex items-center space-x-4">
                                <div
                                    class="w-16 h-16 flex items-center justify-center bg-gray-100 rounded-md border border-gray-200 overflow-hidden">
                                    <img v-if="previewLogo || currentOrganisation?.logoUrl"
                                        :src="previewLogo || currentOrganisation?.logoUrl" :alt="formData.name"
                                        class="w-full h-full object-cover">
                                    <UIcon v-else name="i-heroicons-building-office" class="w-8 h-8 text-gray-500" />
                                </div>
                                <div>
                                    <UButton type="button" size="sm" @click="triggerFileInput">
                                        Choisir un logo
                                    </UButton>
                                    <input ref="fileInput" type="file" class="hidden" accept="image/*"
                                        @change="handleLogoChange">
                                </div>
                            </div>
                        </div>

                        <!-- Organisation Name -->
                        <div>
                            <UFormField label="Nom" name="name">
                                <UInput v-model="formData.name" class="w-full" placeholder="Nom" />
                            </UFormField>
                        </div>

                        <!-- SIREN -->
                        <div>
                            <UFormField label="SIREN" name="siren">
                                <UInput v-model="formData.siren" placeholder="Numéro SIREN" pattern="^\d{9}$" />
                            </UFormField>
                        </div>

                        <!-- Organisation Address -->
                        <div>
                            <UFormField label="Adresse" name="address">
                                <UInput v-model="formData.address" class="w-full" placeholder="Adresse" />
                            </UFormField>
                        </div>

                    </div>

                    <div class="flex justify-end space-x-3 mt-6">
                        <UButton type="button" color="neutral" variant="ghost" @click="isModalOpen = false">
                            Annuler
                        </UButton>
                        <UButton type="submit" color="primary" :loading="loading">
                            Enregistrer
                        </UButton>
                    </div>
                </form>
            </template>
        </UModal>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'

// Define page meta
definePageMeta({
    middleware: ['auth'],
    requiresAuth: true
})

// Get organisation composable
const { currentOrganisation, loading, fetchCurrentOrganisation, updateOrganisation, uploadOrganisationLogo } = useOrganisation()
const { user } = useAuth()

// Modal state
const isModalOpen = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const selectedLogo = ref<File | null>(null)
const previewLogo = ref<string | null>(null)

// Form data
const formData = reactive({
    name: '',
    address: '',
    siren: ''
})

// Fetch organisation data
onMounted(async () => {
    if (user.value?.organisationId) {
        await fetchCurrentOrganisation(user.value.organisationId)
        if (currentOrganisation.value) {
            formData.name = currentOrganisation.value.name || ''
            formData.address = currentOrganisation.value.address || ''
            formData.siren = currentOrganisation.value.siren || ''
        }
    }
})

// Open edit modal
const openEditModal = () => {
    if (currentOrganisation.value) {
        formData.name = currentOrganisation.value.name
        formData.address = currentOrganisation.value.address
        formData.siren = currentOrganisation.value.siren
    }
}

// Trigger file input
const triggerFileInput = () => {
    fileInput.value?.click()
}

// Handle logo change
const handleLogoChange = (event: Event) => {
    const target = event.target as HTMLInputElement
    if (target.files && target.files.length > 0) {
        selectedLogo.value = target.files[0]
        previewLogo.value = URL.createObjectURL(target.files[0])
    }
}

// Save organisation
const saveOrganisation = async () => {
    if (!user.value?.organisationId) return

    try {
        const updatedOrg = await updateOrganisation(user.value.organisationId, {
            name: formData.name,
            address: formData.address,
            siren: formData.siren
        })

        // Upload logo if selected
        if (updatedOrg && selectedLogo.value) {
            await uploadOrganisationLogo(user.value.organisationId, selectedLogo.value)
        }

        // Close modal and refresh data
        isModalOpen.value = false
        await fetchCurrentOrganisation(user.value.organisationId)
    } catch (error) {
        console.error('Error updating organisation:', error)
    }
}
</script>