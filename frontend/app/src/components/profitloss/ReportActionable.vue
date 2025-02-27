<script setup lang="ts">
import { type PropType } from 'vue';
import { type SelectedReport } from '@/types/reports';

const props = defineProps({
  report: {
    required: true,
    type: Object as PropType<SelectedReport>
  },
  initialOpen: { required: false, type: Boolean, default: false }
});

const emit = defineEmits<{
  (e: 'regenerate'): void;
}>();

const regenerateReport = () => {
  emit('regenerate');
};

const { initialOpen, report } = toRefs(props);
const mainDialogOpen = ref<boolean>(get(initialOpen));

const reportsStore = useReportsStore();
const { actionableItems } = toRefs(reportsStore);

const actionableItemsLength = computed(() => {
  let total = 0;

  const items = get(actionableItems);

  if (items) {
    total = items.missingAcquisitions.length + items.missingPrices.length;
  }

  return total;
});

const { t } = useI18n();
</script>

<template>
  <div v-if="actionableItemsLength" class="d-flex">
    <v-dialog v-model="mainDialogOpen" max-width="1000">
      <template #activator="{ on }">
        <v-btn color="error" depressed v-on="on">
          <span class="pr-2">
            {{ t('profit_loss_report.actionable.show_issues') }}
          </span>
          <v-chip x-small class="px-2" color="error darken-2">
            {{ actionableItemsLength }}
          </v-chip>
        </v-btn>
      </template>
      <report-actionable-card
        v-if="mainDialogOpen"
        :report="report"
        @set-dialog="mainDialogOpen = $event"
        @regenerate="regenerateReport()"
      />
    </v-dialog>
  </div>
</template>
