<script setup lang="ts">
import { BigNumber } from '@rotki/common';

defineProps({
  price: {
    required: true,
    type: BigNumber
  },
  asset: {
    required: true,
    type: String
  }
});

const { t } = useI18n();
</script>

<template>
  <stat-card :title="t('loan_liquidation.title')">
    <loan-row medium :title="t('loan_collateral.liquidation_price')">
      <amount-display
        show-currency="ticker"
        fiat-currency="USD"
        :value="price"
        :min-width="18"
      />
    </loan-row>
  </stat-card>
</template>
