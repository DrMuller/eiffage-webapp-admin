<template>
    <div class="organisations-page p-6">
        <div class="flex justify-between items-center mb-8">
            <h1 class="text-2xl font-bold">Vos organisations</h1>
            <UModal v-model="isModalOpen" title="Ajouter une nouvelle organisation">
                <UButton color="primary" icon="material-symbols-light:add" @click="openAddOrganisationModal">
                    Ajouter une nouvelle organisation
                </UButton>
                <template #body>
                    <div class="p-6">
                        <h2 class="text-xl font-bold text-center mb-6">Nouvelle organisation</h2>

                        <form class="space-y-6" @submit.prevent="submitNewOrganisation">
                            <UFormField label="Nom de l'organisation" required>
                                <UInput v-model="newOrganisation.name" class="w-full"
                                    placeholder="Entrez le nom de l'organisation" required />
                            </UFormField>

                            <UFormField label="SIREN" required>
                                <UInput v-model="newOrganisation.siren" placeholder="Entrez le SIREN" required
                                    pattern="^\d{9}$" />
                            </UFormField>

                            <UFormField label="Adresse" required>
                                <UInput v-model="newOrganisation.address" class="w-full" placeholder="Entrez l'adresse"
                                    required />
                            </UFormField>

                            <UFormField label="Logo" required>
                                <UInput type="file" accept=".jpeg,.jpg,.gif,.png,image/jpeg,image/gif,image/png"
                                    @change="handleLogoChange" />
                            </UFormField>

                            <div class="flex justify-end gap-4">
                                <UButton type="submit" color="primary" :loading="createLoading">
                                    Créer l'organisation
                                </UButton>
                            </div>
                        </form>
                    </div>
                </template>
            </UModal>
        </div>

        <!-- Organisations list section -->
        <div class="mb-12">
            <h2 class="text-xl font-semibold mb-4">Organisations</h2>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div v-for="organisation in organisations" :key="organisation._id"
                    class="flex items-center bg-gray-100 border border-gray-200 rounded-lg px-5 py-4 gap-4 min-w-[260px] cursor-pointer hover:bg-gray-50 transition-colors"
                    @click="navigateToOrganisation(organisation._id)">
                    <div class="organisation-logo w-8 h-8 flex items-center justify-center bg-gray-100 overflow-hidden">
                        <img v-if="organisation.logoUrl" :src="organisation.logoUrl" :alt="organisation.name"
                            class="w-full h-full object-cover">
                        <UIcon v-else name="i-heroicons-building-office" class="w-5 h-5 text-gray-500" />
                    </div>
                    <div class="flex-1 min-w-0">
                        <h3 class="font-medium text-base truncate">{{ organisation.name }}</h3>
                        <p v-if="organisation.description" class="text-sm text-gray-500 truncate">
                            {{ organisation.description }}
                        </p>
                    </div>
                </div>
            </div>

            <div v-if="loading" class="flex justify-center py-8">
                <UIcon name="i-heroicons-arrow-path" class="w-6 h-6 animate-spin text-gray-500" />
            </div>

            <div v-if="organisations.length === 0 && !loading" class="text-center py-10 text-gray-500">
                <UIcon name="i-heroicons-building-office" class="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p class="text-lg">Aucune organisation trouvée</p>
                <p class="text-sm">Commencez par ajouter une nouvelle organisation</p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { Organisation } from '~/types/organisation'

// Define route meta
definePageMeta({
    middleware: ['auth'],
    requiresAuth: true
})

// Get auth composable
const { user } = useAuth()
const router = useRouter()

const organisations = ref<Organisation[]>([])
const newOrganisation = ref({
    name: '',
    description: '',
    siren: '',
    address: '',
})
const isModalOpen = ref(false)

// Check if user is admin
watch(user, (newUser) => {
    if (newUser && !newUser.roles.includes('ADMIN')) {
        navigateTo('/')
    }
}, { immediate: true })

// Get organisation composable
const { loading, uploadOrganisationLogo } = useOrganisation()
const { fetchOrganisationsAdmin, createOrganisation } = useOrganisationAdmin()

const fetchAll = async () => {
    organisations.value = await fetchOrganisationsAdmin()
}

// Fetch organisations on page load
onMounted(async () => {
    await fetchAll()
})

// New organisation data
const createLoading = ref(false)
const selectedLogo = ref<File | null>(null)
// Open add organisation modal
const openAddOrganisationModal = () => {
    newOrganisation.value = {
        name: '',
        description: '',
        siren: '',
        address: '',
    }
    selectedLogo.value = null
    isModalOpen.value = true
}

// Handle logo change
const handleLogoChange = (event: Event) => {
    const input = event.target as HTMLInputElement
    if (input.files && input.files[0]) {
        selectedLogo.value = input.files[0]
    }
}

// Submit new organisation
const submitNewOrganisation = async () => {
    createLoading.value = true
    try {
        let createdOrganisation = await createOrganisation({
            name: newOrganisation.value.name,
            description: newOrganisation.value.description,
            siren: newOrganisation.value.siren,
            address: newOrganisation.value.address,
        })

        // Upload logo if provided
        if (createdOrganisation && selectedLogo.value) {
            createdOrganisation = await uploadOrganisationLogo(createdOrganisation._id, selectedLogo.value)
        }

        if (createdOrganisation) {
            organisations.value.push(createdOrganisation)
        }

        isModalOpen.value = false
    } catch (err) {
        console.error('Error creating organisation:', err)
    } finally {
        createLoading.value = false
    }
}

// Navigation
const navigateToOrganisation = (id: string) => {
    router.push(`/admin/organisation/${id}`)
}
</script>

<style scoped>
.organisation-logo {
    border-radius: 0.375rem;
}
</style>