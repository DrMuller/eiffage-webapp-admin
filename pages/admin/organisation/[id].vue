<template>
    <div class="organisation-details p-6">
        <div class="flex justify-between items-center mb-8">
            <div class="flex items-center gap-4">
                <UButton variant="ghost" icon="i-heroicons-arrow-left" @click="navigateBack">
                    Retour
                </UButton>
                <h1 class="text-2xl font-bold">Détails de l'organisation</h1>
            </div>
        </div>

        <!-- Organisation details section -->
        <div v-if="organisation" class="mb-12">
            <div class="bg-white rounded-lg shadow p-6 mb-8">
                <div class="flex items-start gap-6">
                    <div
                        class="organisation-logo w-16 h-16 flex items-center justify-center bg-gray-100 rounded-lg overflow-hidden">
                        <img v-if="organisation.logoUrl" :src="organisation.logoUrl" :alt="organisation.name"
                            class="w-full h-full object-cover">
                        <UIcon v-else name="i-heroicons-building-office" class="w-8 h-8 text-gray-500" />
                    </div>
                    <div class="flex-1">
                        <h2 class="text-xl font-semibold mb-2">{{ organisation.name }}</h2>
                        <p v-if="organisation.description" class="text-gray-600 mb-4">{{ organisation.description }}</p>
                        <div class="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span class="font-medium">SIREN:</span>
                                <span class="ml-2">{{ organisation.siren }}</span>
                            </div>
                            <div>
                                <span class="font-medium">Adresse:</span>
                                <span class="ml-2">{{ organisation.address }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Users section -->
            <div class="bg-white rounded-lg shadow">
                <div class="p-6 border-b">
                    <div class="flex justify-between items-center">
                        <h3 class="text-lg font-semibold">Utilisateurs</h3>
                        <UButton color="primary" icon="i-heroicons-plus" @click="openAddUserModal">
                            Ajouter un utilisateur
                        </UButton>
                    </div>
                </div>

                <div class="p-6">
                    <div v-if="usersLoading" class="flex justify-center py-8">
                        <UIcon name="i-heroicons-arrow-path" class="w-6 h-6 animate-spin text-gray-500" />
                    </div>

                    <div v-else-if="users && users.length === 0" class="text-center py-10 text-gray-500">
                        <UIcon name="i-heroicons-user-group" class="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p class="text-lg">Aucun utilisateur trouvé</p>
                        <p class="text-sm">Commencez par ajouter un nouvel utilisateur</p>
                    </div>

                    <div v-else class="space-y-4">
                        <div v-for="user in users" :key="user._id"
                            class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div class="flex items-center gap-4">
                                <div class="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                    <UIcon name="i-heroicons-user" class="w-6 h-6 text-gray-500" />
                                </div>
                                <div>
                                    <h4 class="font-medium">{{ user.firstName }} {{ user.lastName }}</h4>
                                    <p class="text-sm text-gray-500">{{ user.email }}</p>
                                </div>
                            </div>
                            <div class="flex items-center gap-2">
                                <UBadge v-for="role in user.roles" :key="role" color="primary" variant="soft">
                                    {{ role }}
                                </UBadge>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Add User Modal -->
        <UModal v-model:open="showAddUserModal" title="Ajouter un utilisateur">
            <template #body>
                <div class="p-6">
                    <form class="space-y-6" @submit.prevent="submitNewUser">
                        <UFormField label="Prénom" required>
                            <UInput v-model="newUser.firstName" placeholder="Entrez le prénom" required />
                        </UFormField>

                        <UFormField label="Nom" required>
                            <UInput v-model="newUser.lastName" placeholder="Entrez le nom" required />
                        </UFormField>

                        <UFormField label="Email" required>
                            <UInput v-model="newUser.email" type="email" placeholder="Entrez l'email" required />
                        </UFormField>

                        <div class="flex justify-end gap-4">
                            <UButton type="submit" color="primary" :loading="createUserLoading">
                                Créer l'utilisateur
                            </UButton>
                        </div>
                    </form>
                </div>
            </template>
        </UModal>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { User } from '~/types/auth'
import type { Organisation } from '~/types/organisation'
const route = useRoute()
const router = useRouter()
const users = ref<User[] | undefined>([])
const organisation = ref<Organisation | undefined>(undefined)

// Get organisation composable
const { fetchOrganisationById } = useOrganisation()
const { createUserAdmin, fetchUsersAdmin, loading: usersLoading } = useUserAdmin()

// State
const showAddUserModal = ref(false)
const createUserLoading = ref(false)
const newUser = ref({
    firstName: '',
    lastName: '',
    email: '',
    organisationId: route.params.id as string
})


// Fetch organisation details

onMounted(async () => {
    if (route.params.id) {
        organisation.value = await fetchOrganisationById(route.params.id as string)
        users.value = await fetchUsersAdmin(route.params.id as string)
    }
})

// Navigation
const navigateBack = () => {
    router.push('/admin/organisation')
}

// Modal handlers
const openAddUserModal = () => {
    showAddUserModal.value = true
}

const closeAddUserModal = () => {
    showAddUserModal.value = false
    newUser.value = {
        firstName: '',
        lastName: '',
        email: '',
        organisationId: route.params.id as string
    }
}

// Submit new user
const submitNewUser = async () => {
    createUserLoading.value = true
    try {
        const user = await createUserAdmin(newUser.value)
        if (user) {
            users.value?.push(user)
        }
        closeAddUserModal()
    } catch (err) {
        console.error('Error creating user:', err)
    } finally {
        createUserLoading.value = false
    }
}
</script>

<style scoped>
.organisation-logo {
    border-radius: 0.375rem;
}
</style>