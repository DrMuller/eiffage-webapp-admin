<template>
  <div class="mt-4 px-6">
    <CaptableRequestCommonSharesTable class="mb-8" :common-shares="captableRequest.common_shares"
      @update:common-shares="updateCommonShares" @add:common-share="addCommonShare" />

    <CaptableRequestPreferredSharesTable :preference-shares="captableRequest.pref_shares"
      :carve-out="captableRequest.params.carve_out"
      :estimated-transfer-date="captableRequest.params.estimated_transfer_date" class="mb-8"
      @update:preference-shares="updatePrefShares" @update:carve-out="updateCarveOut"
      @update:estimated-transfer-date="updateEstimatedTransferDate" @add:preference-share="addPreferenceShare" />

    <CaptableRequestOptionsTable class="mb-8" :options="captableRequest.options" @update:options="updateOptions"
      @add:option="addOption" />
  </div>
</template>

<script setup lang="ts">
import type { CaptableRequest, CommonShareRequest, OptionRequest, PrefShareRequest } from '~/types/captable';

const props = defineProps({
  captableRequest: {
    type: Object as () => CaptableRequest,
    required: true
  }
});

const emit = defineEmits(['update:captableRequest']);

const updateCommonShares = (shares: CommonShareRequest[]) => {
  emit('update:captableRequest', {
    ...props.captableRequest,
    common_shares: shares
  });
};

const updatePrefShares = (shares: PrefShareRequest[]) => {
  emit('update:captableRequest', {
    ...props.captableRequest,
    pref_shares: shares
  });
};

const updateCarveOut = (value: number) => {
  emit('update:captableRequest', {
    ...props.captableRequest,
    params: {
      ...props.captableRequest.params,
      carve_out: value
    }
  });
};

const updateEstimatedTransferDate = (date: Date | undefined) => {
  emit('update:captableRequest', {
    ...props.captableRequest,
    params: {
      ...props.captableRequest.params,
      estimated_transfer_date: date
    }
  });
};

const addCommonShare = () => {
  emit('update:captableRequest', {
    ...props.captableRequest,
    common_shares: [...props.captableRequest.common_shares, {
      name: '',
      date: new Date(),
      nb_shares: 0,
      share_price: 0,
      amount: 0
    }]
  });
};

const addPreferenceShare = () => {
  emit('update:captableRequest', {
    ...props.captableRequest,
    pref_shares: [...props.captableRequest.pref_shares, {
      name: '',
      date: new Date(),
      seniority: props.captableRequest.pref_shares.length + 1,
      nb_shares: 0,
      share_price: 0,
      amount: 0,
      pref_type: 'P',
      pref_multiple: 1,
      pref_tri: 0
    }]
  });
};

const updateOptions = (updatedOptions: OptionRequest[]) => {
  emit('update:captableRequest', {
    ...props.captableRequest,
    options: updatedOptions
  });
};

const addOption = () => {
  emit('update:captableRequest', {
    ...props.captableRequest,
    options: [...props.captableRequest.options, {
      name: '',
      date: new Date(),
      nb_options: 0,
      strike: 0,
      nb_dead_options: 0,
      nb_alive_options: 0
    }]
  });
};
</script>