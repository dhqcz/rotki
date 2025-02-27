<script setup lang="ts">
import { type Ref } from 'vue';
import { type HistoryEventEntry } from '@/types/history/events';
import { CURRENCY_USD } from '@/types/currencies';

const props = withDefaults(
  defineProps<{
    event: HistoryEventEntry;
    showEventDetail?: boolean;
  }>(),
  {
    showEventDetail: false
  }
);

const { t } = useI18n();

const { event, showEventDetail } = toRefs(props);
const { assetSymbol } = useAssetInfoRetrieval();

const { getEventType } = useHistoryEventMappings();

const showBalance = computed<boolean>(() => {
  const type = get(getEventType(event));
  return !type || !['approval', 'informational'].includes(type);
});

const eventAsset = useRefMap(event, ({ asset }) => asset);

const symbol = assetSymbol(eventAsset);
const extraDataPanel: Ref<number[]> = ref([]);

const evmEvent = isEvmEventRef(event);

const showLiquityDetail = computed(() => {
  const evmEventVal = get(evmEvent);

  return (
    evmEventVal &&
    get(showEventDetail) &&
    get(event).hasDetails &&
    evmEventVal.counterparty === 'liquity'
  );
});
</script>

<template>
  <div>
    <div class="py-2 d-flex align-center">
      <div class="mr-2">
        <asset-link :asset="event.asset" icon>
          <asset-icon size="32px" :identifier="event.asset" />
        </asset-link>
      </div>
      <div v-if="showBalance">
        <div>
          <amount-display :value="event.balance.amount" :asset="event.asset" />
        </div>
        <div>
          <amount-display
            :key="event.timestamp"
            :amount="event.balance.amount"
            :value="event.balance.usdValue"
            :price-asset="event.asset"
            :fiat-currency="CURRENCY_USD"
            class="grey--text"
            :timestamp="event.timestamp"
          />
        </div>
      </div>
      <div v-else>
        {{ symbol }}
      </div>
    </div>
    <v-expansion-panels
      v-if="showLiquityDetail"
      v-model="extraDataPanel"
      multiple
    >
      <v-expansion-panel>
        <v-expansion-panel-header>
          <template #default="{ open }">
            <div class="success--text font-weight-bold">
              {{
                open
                  ? t('liquity_staking_details.view.hide')
                  : t('liquity_staking_details.view.show')
              }}
            </div>
          </template>
        </v-expansion-panel-header>
        <v-expansion-panel-content class="pt-4">
          <history-event-liquity-extra-data :event="event" />
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
  </div>
</template>
