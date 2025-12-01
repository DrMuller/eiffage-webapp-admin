<template>
  <div class="logout-container" />
</template>

<script setup lang="ts">
definePageMeta({ layout: 'empty' })
useHead({ title: 'Logout | Eiffage' })
const { clearAuth } = useAuth()
const $router = useRouter()
clearAuth()
$router.push('signin')
</script>

<style scoped></style>