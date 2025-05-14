<template>
  <UApp :toaster="appConfig.toaster">
    <div class="app">
      <NuxtLoadingIndicator color="#0034DF" error-color="#ed492c" />
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </div>
  </UApp>
</template>

<script setup lang="ts">
import appConfig from './app.config';
import { onMounted } from 'vue';

const { initAuth } = useAuth();

onMounted(() => {
  initAuth();
});
</script>

<style></style>
