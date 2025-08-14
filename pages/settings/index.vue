<template>
  <div class="max-w-2xl mx-auto p-6">
    <div class="bg-white rounded-lg shadow-sm border p-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-6">Settings</h1>
      
      <div class="space-y-6">
        <!-- Profile Section -->
        <div class="border-b pb-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Profile Information</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <UInput v-model="profile.firstName" disabled />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <UInput v-model="profile.lastName" disabled />
            </div>
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <UInput v-model="profile.email" disabled />
            </div>
          </div>
          <p class="text-sm text-gray-500 mt-2">
            Profile editing is not yet implemented in this boilerplate.
          </p>
        </div>

        <!-- Account Actions -->
        <div class="border-b pb-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Account Actions</h2>
          <div class="space-y-3">
            <UButton 
              color="red" 
              variant="outline" 
              @click="logout"
              :loading="isLoggingOut"
            >
              Sign Out
            </UButton>
          </div>
        </div>

        <!-- Navigation -->
        <div>
          <UButton 
            to="/" 
            variant="outline" 
            color="gray"
          >
            ← Back to Dashboard
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

useHead({ title: 'Settings' })

// Define route meta
definePageMeta({
  middleware: ['auth'],
  requiresAuth: true
})

const { user, clearAuth } = useAuth()
const isLoggingOut = ref(false)

const profile = computed(() => ({
  firstName: user.value?.firstName || '',
  lastName: user.value?.lastName || '',
  email: user.value?.email || ''
}))

const logout = async () => {
  isLoggingOut.value = true
  try {
    clearAuth()
    await navigateTo('/auth/signin')
  } catch (error) {
    console.error('Logout error:', error)
  } finally {
    isLoggingOut.value = false
  }
}
</script>