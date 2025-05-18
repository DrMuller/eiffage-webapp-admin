<script setup lang="ts">
import { onMounted } from 'vue'

useHead({ title: 'Redirect' })

// Define route meta
definePageMeta({
  middleware: ['auth'],
  requiresAuth: true
})

// Redirect to client page
onMounted(() => {
  navigateTo('/dossier')
})
</script>