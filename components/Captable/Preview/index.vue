<template>
  <div class="mt-4 px-6">
    <UAlert variant="subtle" color="warning" icon="i-heroicons-exclamation-triangle"
      description="Veuillez vérifier ces informations pour les ajouter à l'espace de votre client." />
    <CaptablePreviewCommonSharesTableReadOnly class="mb-8" :common-shares="captableRequest.common_shares" />

    <CaptablePreviewPreferredSharesTableReadOnly :preference-shares="captableRequest.pref_shares"
      :carve-out="captableRequest.params.carve_out"
      :estimated-transfer-date="captableRequest.params.estimated_transfer_date" class="mb-8" />

    <CaptablePreviewOptionsTableReadOnly class="mb-8" :options="captableRequest.options" />
  </div>
</template>

<script setup lang="ts">
import type { CaptableRequest } from '~/types/captable';

defineProps({
  captableRequest: {
    type: Object as () => CaptableRequest,
    required: true
  }
});

// console.log(props.captableRequest);
</script>