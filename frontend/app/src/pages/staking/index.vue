<script setup lang="ts">
import { type PropType } from 'vue';
import { Routes } from '@/router/routes';

interface StakingInfo {
  id: string;
  icon: string;
  name: string;
  img?: boolean;
}

const iconSize = '64px';

const pages = {
  eth2: defineAsyncComponent(
    () => import('@/components/staking/eth/EthStakingPage.vue')
  ),
  liquity: defineAsyncComponent(
    () => import('@/components/staking/liquity/LiquityPage.vue')
  ),
  kraken: defineAsyncComponent(
    () => import('@/components/staking/kraken/KrakenPage.vue')
  )
};

const props = defineProps({
  location: {
    required: false,
    type: String as PropType<'eth2' | 'liquity' | 'kraken' | null>,
    default: null
  }
});

const { location } = toRefs(props);

const { t } = useI18n();

const staking = computed<StakingInfo[]>(() => [
  {
    id: 'eth2',
    icon: './assets/images/protocols/ethereum.svg',
    name: t('staking.eth2')
  },
  {
    id: 'liquity',
    icon: './assets/images/protocols/liquity.png',
    name: t('staking.liquity')
  },
  {
    id: 'kraken',
    icon: './assets/images/protocols/kraken.svg',
    name: t('staking.kraken')
  }
]);

const router = useRouter();

const lastLocation = useLocalStorage('rotki.staking.last_location', '');

const page = computed(() => {
  const selectedLocation = get(location);
  return selectedLocation ? pages[selectedLocation] : null;
});

const updateLocation = async (location: string) => {
  if (location) {
    set(lastLocation, location);
  }
  await router.push(Routes.STAKING.replace(':location*', location));
};

onBeforeMount(async () => {
  if (get(lastLocation)) {
    await updateLocation(get(lastLocation));
  }
});
</script>

<template>
  <v-container>
    <card>
      <div class="pa-2">
        <v-select
          :value="location"
          outlined
          hide-details
          :items="staking"
          :label="t('staking_page.dropdown_label')"
          item-value="id"
          @change="updateLocation($event)"
        >
          <template v-for="slot in ['item', 'selection']" #[slot]="data">
            <v-row v-if="data.item" :key="slot" align="center">
              <v-col cols="auto">
                <adaptive-wrapper width="24" height="24">
                  <v-img
                    width="24px"
                    contain
                    max-height="24px"
                    :src="data.item.icon"
                  />
                </adaptive-wrapper>
              </v-col>
              <v-col class="pl-0">
                {{ data.item.name }}
              </v-col>
            </v-row>
          </template>
        </v-select>
      </div>
    </card>
    <div v-if="page" class="pt-4">
      <component :is="page" />
    </div>
    <div v-else>
      <div
        class="d-flex flex-row align-center justify-md-end justify-center mt-2 mr-md-6"
      >
        <div class="flex-shrink-0">
          <v-icon>mdi-arrow-up-left</v-icon>
        </div>
        <div class="text--secondary pt-3 flex-shrink-0 ms-2">
          {{ t('staking_page.dropdown_hint') }}
        </div>
      </div>
      <full-size-content>
        <v-row align="center" justify="center">
          <v-col>
            <v-row align="center" justify="center">
              <v-col cols="auto">
                <span class="font-weight-bold text-h5">
                  {{ t('staking_page.page.title') }}
                </span>
              </v-col>
            </v-row>
            <v-row justify="center" class="mt-md-12 mt-4">
              <v-col cols="auto" class="mx-4">
                <internal-link to="/staking/eth2">
                  <v-img
                    :width="iconSize"
                    :height="iconSize"
                    contain
                    src="/assets/images/protocols/ethereum.svg"
                  />
                </internal-link>
              </v-col>
              <v-col cols="auto" class="mx-4">
                <internal-link to="/staking/liquity">
                  <v-img
                    :width="iconSize"
                    contain
                    src="/assets/images/protocols/liquity.png"
                  />
                </internal-link>
              </v-col>
              <v-col cols="auto" class="mx-4">
                <internal-link to="/staking/kraken">
                  <v-img
                    :width="iconSize"
                    contain
                    src="/assets/images/protocols/kraken.svg"
                  />
                </internal-link>
              </v-col>
            </v-row>

            <v-row class="mt-md-10 mt-2" justify="center">
              <v-col cols="auto">
                <div
                  class="font-weight-light text-h6"
                  :class="$style.description"
                >
                  {{ t('staking_page.page.description') }}
                </div>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </full-size-content>
    </div>
  </v-container>
</template>

<style lang="scss" module>
.content {
  height: calc(100% - 120px);
}

.description {
  text-align: center;
  max-width: 600px;
}
</style>
