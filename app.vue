<template>
  <UApp :toaster="appConfig.toaster" :tooltip="appConfig">
    <div class="app">
      <NuxtLoadingIndicator color="hsl(133 66% 74% / 95%)" error-color="hsl(10 100% 62% / 95%)" />
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </div>
  </UApp>
</template>

<script setup lang="ts">
import appConfig from './app.config';
</script>

<style></style>
