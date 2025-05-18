<template>
    <div class="container mx-auto px-4 py-8">
        <h1 class="text-2xl font-semibold mb-6">Utilisateurs de votre organisation</h1>

        <!-- Users list section -->
        <div class="bg-white rounded-lg shadow">
            <div class="p-6">
                <div v-if="usersLoading" class="flex justify-center py-8">
                    <UIcon name="i-heroicons-arrow-path" class="w-6 h-6 animate-spin text-gray-500" />
                </div>

                <div v-else-if="users && users.length === 0" class="text-center py-10 text-gray-500">
                    <UIcon name="i-heroicons-user-group" class="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p class="text-lg">Aucun utilisateur trouvé</p>
                    <p class="text-sm">Votre organisation n'a pas encore d'utilisateurs</p>
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
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { User } from '~/types/auth'

const users = ref<User[]>([])
const usersLoading = ref(true)

// Define route meta
definePageMeta({
    middleware: ['auth'],
    requiresAuth: true
})

// Get auth and organisation composables
const { user } = useAuth()
const { fetchUsersByOrganisationId } = useOrganisation()


// Fetch users when user data becomes available
const fetchUsers = async () => {
    if (!user.value?.organisationId) return

    usersLoading.value = true
    try {
        users.value = await fetchUsersByOrganisationId(user.value.organisationId) || []
    } catch (err) {
        console.error('Error fetching users:', err)
    } finally {
        usersLoading.value = false
    }
}

// Watch for user changes and fetch users when user data is available
watch(() => user.value, (newUser) => {
    if (newUser?.organisationId) {
        fetchUsers()
    }
}, { immediate: true })
</script>
