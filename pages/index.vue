<template>
  <div class="sr-only">Redirecting…</div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['auth'],
  requiresAuth: true
})

await navigateTo('/employes')
</script>