<script setup lang="ts">
import { type AssetBalance, BigNumber } from '@rotki/common';
import { type PropType } from 'vue';

defineProps({
  collateral: {
    required: true,
    type: Object as PropType<AssetBalance>
  },
  ratio: {
    required: false,
    type: BigNumber as PropType<BigNumber | null | undefined>,
    default: null
  }
});

const { t } = useI18n();
</script>

<template>
  <stat-card :title="t('loan_collateral.title')">
    <loan-row medium :title="t('loan_collateral.locked_collateral')">
      <balance-display :asset="collateral.asset" :value="collateral" />
    </loan-row>

    <v-divider v-if="ratio" class="my-4" />

    <loan-row v-if="ratio" :title="t('loan_collateral.ratio')">
      <percentage-display v-if="ratio" :value="ratio.toFormat(2)" />
    </loan-row>
  </stat-card>
</template>
