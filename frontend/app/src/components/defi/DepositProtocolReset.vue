<script setup lang="ts">
import { DefiProtocol } from '@rotki/common/lib/blockchain';

defineProps({
  loading: {
    required: true,
    type: Boolean
  }
});

const emit = defineEmits(['reset']);

const resetSelection = ref<DefiProtocol[]>([]);
const premium = usePremium();
const AAVE = DefiProtocol.AAVE;
const YEARN_VAULTS = DefiProtocol.YEARN_VAULTS;
const YEARN_VAULTS_V2 = DefiProtocol.YEARN_VAULTS_V2;

const { t } = useI18n();

const reset = () => {
  emit('reset', get(resetSelection));
};
</script>

<template>
  <confirmable-reset
    v-if="premium"
    :loading="loading"
    :tooltip="t('lending.reset_tooltip')"
    :disabled="resetSelection.length === 0"
    @reset="reset()"
  >
    {{ t('lending.reset_confirm') }}
    <div />
    <v-row>
      <v-col class="text-center font-weight-medium">
        {{ t('lending.reset.protocol_selection') }}
      </v-col>
    </v-row>
    <v-row align="center" justify="center">
      <v-col cols="auto">
        <v-btn-toggle v-model="resetSelection" multiple>
          <v-btn icon :value="AAVE">
            <defi-protocol-icon mode="icon" :protocol="AAVE" />
          </v-btn>
          <v-btn icon :value="YEARN_VAULTS">
            <defi-protocol-icon mode="icon" :protocol="YEARN_VAULTS" />
          </v-btn>
          <v-btn icon :value="YEARN_VAULTS_V2">
            <defi-protocol-icon mode="icon" :protocol="YEARN_VAULTS_V2" />
          </v-btn>
        </v-btn-toggle>
      </v-col>
    </v-row>
  </confirmable-reset>
</template>
