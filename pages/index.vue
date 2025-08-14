<template>
  <div class="max-w-4xl mx-auto p-6">
    <div class="bg-white rounded-lg shadow-sm border p-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-4">
        Welcome back, {{ user?.firstName }}!
      </h1>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        <div class="bg-blue-50 rounded-lg p-6 border border-blue-200">
          <div class="flex items-center">
            <UIcon name="i-heroicons-user-circle" class="h-8 w-8 text-blue-600" />
            <h3 class="ml-3 text-lg font-medium text-blue-900">Profile</h3>
          </div>
          <p class="mt-2 text-sm text-blue-700">
            Manage your account settings and preferences
          </p>
          <UButton 
            to="/settings" 
            variant="outline" 
            color="blue" 
            size="sm" 
            class="mt-4"
          >
            View Profile
          </UButton>
        </div>

        <div class="bg-green-50 rounded-lg p-6 border border-green-200">
          <div class="flex items-center">
            <UIcon name="i-heroicons-cog-6-tooth" class="h-8 w-8 text-green-600" />
            <h3 class="ml-3 text-lg font-medium text-green-900">Settings</h3>
          </div>
          <p class="mt-2 text-sm text-green-700">
            Configure your application preferences
          </p>
          <UButton 
            to="/settings" 
            variant="outline" 
            color="green" 
            size="sm" 
            class="mt-4"
          >
            Open Settings
          </UButton>
        </div>

        <div class="bg-purple-50 rounded-lg p-6 border border-purple-200">
          <div class="flex items-center">
            <UIcon name="i-heroicons-information-circle" class="h-8 w-8 text-purple-600" />
            <h3 class="ml-3 text-lg font-medium text-purple-900">Help</h3>
          </div>
          <p class="mt-2 text-sm text-purple-700">
            Get help and support documentation
          </p>
          <UButton 
            variant="outline" 
            color="purple" 
            size="sm" 
            class="mt-4"
            disabled
          >
            Coming Soon
          </UButton>
        </div>
      </div>

      <div class="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 class="text-lg font-medium text-gray-900 mb-2">Account Information</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span class="font-medium text-gray-700">Email:</span>
            <span class="ml-2 text-gray-600">{{ user?.email }}</span>
          </div>
          <div>
            <span class="font-medium text-gray-700">Role:</span>
            <span class="ml-2 text-gray-600">{{ user?.roles?.join(', ') }}</span>
          </div>
          <div>
            <span class="font-medium text-gray-700">Member since:</span>
            <span class="ml-2 text-gray-600">
              {{ user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A' }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({ title: 'Dashboard' })

// Define route meta
definePageMeta({
  middleware: ['auth'],
  requiresAuth: true
})

const { user } = useAuth()
</script>