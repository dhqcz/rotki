<script setup lang="ts">
import { DefiProtocol } from '@rotki/common/lib/blockchain';
import { type PropType } from 'vue';
import { type Module } from '@/types/modules';
import { Section } from '@/types/status';

defineProps({
  modules: { required: true, type: Array as PropType<Module[]> }
});

const selection = ref<string>();
const protocol = ref<DefiProtocol | null>(null);
const defiLending = useDefiLending();
const route = useRoute();
const { t } = useI18n();

const { shouldShowLoadingScreen, isLoading } = useStatusStore();

const loading = shouldShowLoadingScreen(Section.DEFI_BORROWING);

const selectedProtocols = computed(() => {
  const selected = get(protocol);
  return selected ? [selected] : [];
});

const loan = computed(() => get(defiLending.loan(get(selection))));

const loans = computed(() => {
  const protocols = get(selectedProtocols);
  return get(defiLending.loans(protocols));
});

const summary = computed(() => {
  const protocols = get(selectedProtocols);
  return get(defiLending.loanSummary(protocols));
});

const refreshing = logicOr(
  isLoading(Section.DEFI_BORROWING),
  isLoading(Section.DEFI_BORROWING_HISTORY)
);

const refresh = async () => {
  await defiLending.fetchBorrowing(true);
};

onMounted(async () => {
  const currentRoute = get(route);
  const queryElement = currentRoute.query['protocol'];
  const protocols = Object.values(DefiProtocol);
  const protocolIndex = protocols.indexOf(queryElement as DefiProtocol);
  if (protocolIndex >= 0) {
    set(protocol, protocols[protocolIndex]);
  }
  await defiLending.fetchBorrowing(false);
});
</script>

<template>
  <progress-screen v-if="loading">
    <template #message>{{ t('borrowing.loading') }}</template>
  </progress-screen>
  <div v-else>
    <v-row class="mt-8">
      <v-col>
        <refresh-header
          :title="t('borrowing.header')"
          :loading="refreshing"
          @refresh="refresh()"
        >
          <template #actions>
            <active-modules :modules="modules" />
          </template>
        </refresh-header>
      </v-col>
    </v-row>
    <v-row no-gutters class="mt-6">
      <v-col cols="12">
        <stat-card-wide :cols="2">
          <template #first-col>
            <stat-card-column>
              <template #title>
                {{ t('borrowing.total_collateral_locked') }}
              </template>
              <amount-display
                :value="summary.totalCollateralUsd"
                show-currency="symbol"
                fiat-currency="USD"
              />
            </stat-card-column>
          </template>
          <template #second-col>
            <stat-card-column>
              <template #title>
                {{ t('borrowing.total_outstanding_debt') }}
              </template>
              <amount-display
                :value="summary.totalDebt"
                show-currency="symbol"
                fiat-currency="USD"
              />
            </stat-card-column>
          </template>
        </stat-card-wide>
      </v-col>
    </v-row>
    <v-row no-gutters class="mt-8">
      <v-col cols="12" md="6" class="pe-md-4">
        <v-card>
          <div class="mx-4 pt-4">
            <v-autocomplete
              v-model="selection"
              class="borrowing__vault-selection"
              :label="t('borrowing.select_loan')"
              chips
              dense
              outlined
              item-key="identifier"
              :items="loans"
              item-text="identifier"
              hide-details
              clearable
              :open-on-clear="false"
            >
              <template #selection="{ item }">
                <defi-selector-item :item="item" />
              </template>
              <template #item="{ item }">
                <defi-selector-item :item="item" />
              </template>
            </v-autocomplete>
          </div>
          <v-card-text>{{ t('borrowing.select_loan_hint') }}</v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="6" class="ps-md-4 pt-8 pt-md-0">
        <defi-protocol-selector v-model="protocol" liabilities />
      </v-col>
    </v-row>
    <loan-info v-if="loan" :loan="loan" />
    <full-size-content v-else>
      <v-row align="center" justify="center">
        <v-col class="text-h6">{{ t('liabilities.no_selection') }}</v-col>
      </v-row>
    </full-size-content>
  </div>
</template>
