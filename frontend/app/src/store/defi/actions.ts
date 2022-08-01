import { DefiProtocol } from '@rotki/common/lib/blockchain';
import { AaveBalances, AaveHistory } from '@rotki/common/lib/defi/aave';
import { ActionTree } from 'vuex';
import i18n from '@/i18n';
import { balanceKeys } from '@/services/consts';
import {
  aaveHistoryKeys,
  dsrKeys,
  ProtocolVersion,
  vaultDetailsKeys,
  vaultKeys
} from '@/services/defi/consts';
import { ApiMakerDAOVault } from '@/services/defi/types';
import {
  CompoundBalances,
  CompoundHistory
} from '@/services/defi/types/compound';
import { api } from '@/services/rotkehlchen-api';
import { ALL_MODULES } from '@/services/session/consts';
import { Section, Status } from '@/store/const';
import { useBalancerStore } from '@/store/defi/balancer';
import { ACTION_PURGE_PROTOCOL } from '@/store/defi/const';
import { convertMakerDAOVaults } from '@/store/defi/converters';
import { useLiquityStore } from '@/store/defi/liquity';
import { defaultCompoundHistory } from '@/store/defi/state';
import {
  Airdrops,
  AllDefiProtocols,
  DefiState,
  DSRBalances,
  DSRHistory,
  MakerDAOVaultDetails
} from '@/store/defi/types';
import { useYearnStore } from '@/store/defi/yearn';
import { useNotifications } from '@/store/notifications';
import { useTasks } from '@/store/tasks';
import { RotkehlchenState } from '@/store/types';
import {
  getStatus,
  getStatusUpdater,
  isLoading,
  setStatus
} from '@/store/utils';
import { Module } from '@/types/modules';
import { TaskMeta } from '@/types/task';
import { TaskType } from '@/types/task-type';
import { Zero } from '@/utils/bignumbers';

export const actions: ActionTree<DefiState, RotkehlchenState> = {
  async fetchDSRBalances(
    { commit, rootState: { session } },
    refresh: boolean = false
  ) {
    const { activeModules } = session!.generalSettings;
    if (!activeModules.includes(Module.MAKERDAO_DSR)) {
      return;
    }
    const section = Section.DEFI_DSR_BALANCES;
    const currentStatus = getStatus(section);

    if (
      isLoading(currentStatus) ||
      (currentStatus === Status.LOADED && !refresh)
    ) {
      return;
    }

    const newStatus = refresh ? Status.REFRESHING : Status.LOADING;
    setStatus(newStatus, section);

    const { awaitTask } = useTasks();

    try {
      const taskType = TaskType.DSR_BALANCE;
      const { taskId } = await api.defi.dsrBalance();
      const { result } = await awaitTask<DSRBalances, TaskMeta>(
        taskId,
        taskType,
        {
          title: i18n.tc('actions.defi.dsr_balances.task.title'),
          numericKeys: dsrKeys
        }
      );
      commit('dsrBalances', result);
    } catch (e: any) {
      const message = i18n.tc(
        'actions.defi.dsr_balances.error.description',
        undefined,
        {
          error: e.message
        }
      );
      const title = i18n.tc('actions.defi.dsr_balances.error.title');
      const { notify } = useNotifications();
      notify({
        title,
        message,
        display: true
      });
    }

    setStatus(Status.LOADED, section);
  },

  async fetchDSRHistory(
    { commit, rootState: { session } },
    refresh: boolean = false
  ) {
    const { activeModules } = session!.generalSettings;
    if (!activeModules.includes(Module.MAKERDAO_DSR) || !session?.premium) {
      return;
    }
    const section = Section.DEFI_DSR_HISTORY;
    const currentStatus = getStatus(section);

    if (
      isLoading(currentStatus) ||
      (currentStatus === Status.LOADED && !refresh)
    ) {
      return;
    }

    const newStatus = refresh ? Status.REFRESHING : Status.LOADING;
    setStatus(newStatus, section);
    const { awaitTask } = useTasks();

    try {
      const taskType = TaskType.DSR_HISTORY;
      const { taskId } = await api.defi.dsrHistory();
      const { result } = await awaitTask<DSRHistory, TaskMeta>(
        taskId,
        taskType,
        {
          title: i18n.tc('actions.defi.dsr_history.task.title'),
          numericKeys: balanceKeys
        }
      );

      commit('dsrHistory', result);
    } catch (e: any) {
      const message = i18n.tc(
        'actions.defi.dsr_history.error.description',
        undefined,
        {
          error: e.message
        }
      );
      const title = i18n.tc('actions.defi.dsr_history.error.title');
      const { notify } = useNotifications();
      notify({
        title,
        message,
        display: true
      });
    }
    setStatus(Status.LOADED, section);
  },

  async fetchMakerDAOVaults(
    { commit, rootState: { session } },
    refresh: boolean = false
  ) {
    const { activeModules } = session!.generalSettings;
    if (!activeModules.includes(Module.MAKERDAO_VAULTS)) {
      return;
    }
    const section = Section.DEFI_MAKERDAO_VAULTS;
    const currentStatus = getStatus(section);

    if (
      isLoading(currentStatus) ||
      (currentStatus === Status.LOADED && !refresh)
    ) {
      return;
    }

    const newStatus = refresh ? Status.REFRESHING : Status.LOADING;
    setStatus(newStatus, section);
    const { awaitTask } = useTasks();
    try {
      const taskType = TaskType.MAKEDAO_VAULTS;
      const { taskId } = await api.defi.makerDAOVaults();
      const { result } = await awaitTask<ApiMakerDAOVault[], TaskMeta>(
        taskId,
        taskType,
        {
          title: i18n.tc('actions.defi.makerdao_vaults.task.title'),
          numericKeys: vaultKeys
        }
      );

      commit('makerDAOVaults', convertMakerDAOVaults(result));
    } catch (e: any) {
      const message = i18n.tc(
        'actions.defi.makerdao_vaults.error.description',
        undefined,
        {
          error: e.message
        }
      );
      const title = i18n.tc('actions.defi.makerdao_vaults.error.title');
      const { notify } = useNotifications();
      notify({
        title,
        message,
        display: true
      });
    }
    setStatus(Status.LOADED, section);
  },

  async fetchMakerDAOVaultDetails(
    { commit, rootState: { session } },
    refresh: boolean = false
  ) {
    const { activeModules } = session!.generalSettings;
    if (!activeModules.includes(Module.MAKERDAO_VAULTS) || !session?.premium) {
      return;
    }
    const section = Section.DEFI_MAKERDAO_VAULT_DETAILS;
    const currentStatus = getStatus(section);

    if (
      isLoading(currentStatus) ||
      (currentStatus === Status.LOADED && !refresh)
    ) {
      return;
    }

    const newStatus = refresh ? Status.REFRESHING : Status.LOADING;
    setStatus(newStatus, section);

    const { awaitTask } = useTasks();

    try {
      const { taskId } = await api.defi.makerDAOVaultDetails();
      const { result } = await awaitTask<MakerDAOVaultDetails[], TaskMeta>(
        taskId,
        TaskType.MAKERDAO_VAULT_DETAILS,
        {
          title: i18n.tc('actions.defi.makerdao_vault_details.task.title'),
          numericKeys: vaultDetailsKeys
        }
      );

      commit('makerDAOVaultDetails', result);
    } catch (e: any) {
      const message = i18n.tc(
        'actions.defi.makerdao_vault_details.error.description',
        undefined,
        { error: e.message }
      );
      const title = i18n.tc('actions.defi.makerdao_vault_details.error.title');
      const { notify } = useNotifications();
      notify({
        title,
        message,
        display: true
      });
    }

    setStatus(Status.LOADED, section);
  },

  async fetchAaveBalances(
    { commit, rootState: { session } },
    refresh: boolean = false
  ) {
    const { activeModules } = session!.generalSettings;
    if (!activeModules.includes(Module.AAVE)) {
      return;
    }
    const section = Section.DEFI_AAVE_BALANCES;
    const currentStatus = getStatus(section);

    if (
      isLoading(currentStatus) ||
      (currentStatus === Status.LOADED && !refresh)
    ) {
      return;
    }

    const newStatus = refresh ? Status.REFRESHING : Status.LOADING;
    setStatus(newStatus, section);
    const { awaitTask } = useTasks();

    try {
      const taskType = TaskType.AAVE_BALANCES;
      const { taskId } = await api.defi.fetchAaveBalances();
      const { result } = await awaitTask<AaveBalances, TaskMeta>(
        taskId,
        taskType,
        {
          title: i18n.tc('actions.defi.aave_balances.task.title'),
          numericKeys: balanceKeys
        }
      );

      commit('aaveBalances', result);
    } catch (e: any) {
      const message = i18n.tc(
        'actions.defi.aave_balances.error.description',
        undefined,
        {
          error: e.message
        }
      );
      const title = i18n.tc('actions.defi.aave_balances.error.title');
      const { notify } = useNotifications();
      notify({
        title,
        message,
        display: true
      });
    }

    setStatus(Status.LOADED, section);
  },

  async fetchAaveHistory(
    { commit, rootState: { session } },
    payload: { refresh?: boolean; reset?: boolean }
  ) {
    const { activeModules } = session!.generalSettings;
    if (!activeModules.includes(Module.AAVE) || !session?.premium) {
      return;
    }
    const section = Section.DEFI_AAVE_HISTORY;
    const currentStatus = getStatus(section);
    const refresh = payload?.refresh;
    const reset = payload?.reset;

    if (
      isLoading(currentStatus) ||
      (currentStatus === Status.LOADED && !refresh)
    ) {
      return;
    }

    const newStatus = refresh ? Status.REFRESHING : Status.LOADING;
    setStatus(newStatus, section);
    const { awaitTask } = useTasks();

    try {
      const taskType = TaskType.AAVE_HISTORY;
      const { taskId } = await api.defi.fetchAaveHistory(reset);
      const { result } = await awaitTask<AaveHistory, TaskMeta>(
        taskId,
        taskType,
        {
          title: i18n.tc('actions.defi.aave_history.task.title'),
          numericKeys: aaveHistoryKeys
        }
      );

      commit('aaveHistory', result);
    } catch (e: any) {
      const message = i18n.tc(
        'actions.defi.aave_history.error.description',
        undefined,
        { error: e.message }
      );
      const title = i18n.tc('actions.defi.aave_history.error.title');
      const { notify } = useNotifications();
      notify({
        title,
        message,
        display: true
      });
    }

    setStatus(Status.LOADED, section);
  },

  async fetchDefiBalances({ commit }, refresh: boolean) {
    const section = Section.DEFI_BALANCES;
    const currentStatus = getStatus(section);

    if (
      isLoading(currentStatus) ||
      (currentStatus === Status.LOADED && !refresh)
    ) {
      return;
    }

    setStatus(Status.LOADING, section);

    const { awaitTask } = useTasks();
    try {
      const taskType = TaskType.DEFI_BALANCES;
      const { taskId } = await api.defi.fetchAllDefi();
      const { result } = await awaitTask<AllDefiProtocols, TaskMeta>(
        taskId,
        taskType,
        {
          title: i18n.tc('actions.defi.balances.task.title'),
          numericKeys: balanceKeys
        }
      );

      commit('allDefiProtocols', result);
    } catch (e: any) {
      const title = i18n.tc('actions.defi.balances.error.title');
      const message = i18n.tc(
        'actions.defi.balances.error.description',
        undefined,
        { error: e.message }
      );
      const { notify } = useNotifications();
      notify({
        title,
        message,
        display: true
      });
    }
    setStatus(Status.LOADED, section);
  },

  async fetchAllDefi({ dispatch }, refresh: boolean = false) {
    const section = Section.DEFI_OVERVIEW;
    const currentStatus = getStatus(section);
    if (
      isLoading(currentStatus) ||
      (currentStatus === Status.LOADED && !refresh)
    ) {
      return;
    }

    const newStatus = refresh ? Status.REFRESHING : Status.LOADING;
    setStatus(newStatus, section);
    await dispatch('fetchDefiBalances', refresh);
    setStatus(Status.PARTIALLY_LOADED, section);

    const { fetchBalances: fetchLiquityBalances } = useLiquityStore();
    const { fetchBalances: fetchYearnBalances } = useYearnStore();
    await Promise.all([
      dispatch('fetchAaveBalances', refresh),
      dispatch('fetchDSRBalances', refresh),
      dispatch('fetchMakerDAOVaults', refresh),
      dispatch('fetchCompoundBalances', refresh),
      fetchYearnBalances({
        refresh,
        version: ProtocolVersion.V1
      }),
      fetchYearnBalances({
        refresh,
        version: ProtocolVersion.V2
      }),
      fetchLiquityBalances(refresh)
    ]);

    setStatus(Status.LOADED, section);
  },

  async fetchLending({ dispatch, rootState: { session } }, refresh?: boolean) {
    const premium = session?.premium;
    const section = Section.DEFI_LENDING;
    const premiumSection = Section.DEFI_LENDING_HISTORY;
    const currentStatus = getStatus(section);

    const newStatus = refresh ? Status.REFRESHING : Status.LOADING;
    const { fetchBalances: fetchYearnBalances } = useYearnStore();

    if (
      !isLoading(currentStatus) ||
      (currentStatus === Status.LOADED && refresh)
    ) {
      setStatus(newStatus, section);

      await Promise.all([
        dispatch('fetchDSRBalances', refresh).then(() => {
          setStatus(Status.PARTIALLY_LOADED, section);
        }),
        dispatch('fetchAaveBalances', refresh).then(() => {
          setStatus(Status.PARTIALLY_LOADED, section);
        }),
        dispatch('fetchCompoundBalances', refresh).then(() => {
          setStatus(Status.PARTIALLY_LOADED, section);
        }),
        fetchYearnBalances({
          refresh: refresh ?? false,
          version: ProtocolVersion.V1
        }).then(() => {
          setStatus(Status.PARTIALLY_LOADED, section);
        }),
        fetchYearnBalances({
          refresh: refresh ?? false,
          version: ProtocolVersion.V2
        }).then(() => {
          setStatus(Status.PARTIALLY_LOADED, section);
        })
      ]);

      setStatus(Status.LOADED, section);
    }

    const currentPremiumStatus = getStatus(premiumSection);

    if (
      !premium ||
      isLoading(currentPremiumStatus) ||
      (currentPremiumStatus === Status.LOADED && !refresh)
    ) {
      return;
    }

    setStatus(newStatus, premiumSection);

    const { fetchHistory: fetchYearnHistory } = useYearnStore();

    await Promise.all([
      dispatch('fetchDSRHistory', refresh),
      dispatch('fetchAaveHistory', { refresh }),
      dispatch('fetchCompoundHistory', refresh),
      fetchYearnHistory({
        refresh: refresh ?? false,
        version: ProtocolVersion.V1
      }),
      fetchYearnHistory({
        refresh: refresh ?? false,
        version: ProtocolVersion.V2
      })
    ]);

    setStatus(Status.LOADED, premiumSection);
  },

  async resetDB(
    { dispatch, rootState: { session } },
    protocols: DefiProtocol[]
  ) {
    const premiumSection = Section.DEFI_LENDING_HISTORY;
    const currentPremiumStatus = getStatus(premiumSection);
    const premium = session!.premium;

    if (!premium || isLoading(currentPremiumStatus)) {
      return;
    }

    setStatus(Status.REFRESHING, premiumSection);

    const toReset: Promise<void>[] = [];
    const { fetchHistory: fetchYearnVaultsHistory } = useYearnStore();
    if (protocols.includes(DefiProtocol.YEARN_VAULTS)) {
      toReset.push(
        fetchYearnVaultsHistory({
          refresh: true,
          reset: true,
          version: ProtocolVersion.V1
        })
      );
    }

    if (protocols.includes(DefiProtocol.YEARN_VAULTS_V2)) {
      toReset.push(
        fetchYearnVaultsHistory({
          refresh: true,
          reset: true,
          version: ProtocolVersion.V2
        })
      );
    }

    if (protocols.includes(DefiProtocol.AAVE)) {
      toReset.push(
        dispatch('fetchAaveHistory', { refresh: true, reset: true })
      );
    }

    await Promise.all(toReset);

    setStatus(Status.LOADED, premiumSection);
  },

  async fetchBorrowing(
    { dispatch, rootState: { session } },
    refresh: boolean = false
  ) {
    const premium = session?.premium;
    const section = Section.DEFI_BORROWING;
    const premiumSection = Section.DEFI_BORROWING_HISTORY;
    const currentStatus = getStatus(section);
    const newStatus = refresh ? Status.REFRESHING : Status.LOADING;

    const {
      fetchBalances: fetchLiquityBalances,
      fetchEvents: fetchLiquityEvents
    } = useLiquityStore();

    if (
      !isLoading(currentStatus) ||
      (currentStatus === Status.LOADED && refresh)
    ) {
      setStatus(newStatus, section);
      await Promise.all([
        dispatch('fetchMakerDAOVaults', refresh).then(() => {
          setStatus(Status.PARTIALLY_LOADED, section);
        }),
        dispatch('fetchCompoundBalances', refresh).then(() => {
          setStatus(Status.PARTIALLY_LOADED, section);
        }),
        dispatch('fetchAaveBalances', refresh).then(() => {
          setStatus(Status.PARTIALLY_LOADED, section);
        }),
        fetchLiquityBalances(refresh).then(() => {
          setStatus(Status.PARTIALLY_LOADED, section);
        })
      ]);

      setStatus(Status.LOADED, section);
    }

    const currentPremiumStatus = getStatus(premiumSection);

    if (
      !premium ||
      isLoading(currentPremiumStatus) ||
      (currentPremiumStatus === Status.LOADED && !refresh)
    ) {
      return;
    }

    setStatus(newStatus, premiumSection);

    await Promise.all([
      dispatch('fetchMakerDAOVaultDetails', refresh),
      dispatch('fetchCompoundHistory', refresh),
      dispatch('fetchAaveHistory', refresh),
      fetchLiquityEvents(refresh)
    ]);

    setStatus(Status.LOADED, premiumSection);
  },

  async fetchCompoundBalances(
    { commit, rootState: { session } },
    refresh: boolean = false
  ) {
    const { activeModules } = session!.generalSettings;
    if (!activeModules.includes(Module.COMPOUND)) {
      return;
    }

    const section = Section.DEFI_COMPOUND_BALANCES;
    const currentStatus = getStatus(section);

    if (
      isLoading(currentStatus) ||
      (currentStatus === Status.LOADED && !refresh)
    ) {
      return;
    }

    const newStatus = refresh ? Status.REFRESHING : Status.LOADING;
    setStatus(newStatus, section);

    const { awaitTask } = useTasks();
    try {
      const taskType = TaskType.DEFI_COMPOUND_BALANCES;
      const { taskId } = await api.defi.fetchCompoundBalances();
      const { result } = await awaitTask<CompoundBalances, TaskMeta>(
        taskId,
        taskType,
        {
          title: i18n.tc('actions.defi.compound.task.title'),
          numericKeys: balanceKeys
        }
      );
      commit('compoundBalances', result);
    } catch (e: any) {
      const { notify } = useNotifications();
      notify({
        title: i18n.tc('actions.defi.compound.error.title'),
        message: i18n.tc('actions.defi.compound.error.description', undefined, {
          error: e.message
        }),
        display: true
      });
    }
    setStatus(Status.LOADED, section);
  },

  async fetchCompoundHistory(
    { commit, rootState: { session } },
    refresh: boolean = false
  ) {
    const { activeModules } = session!.generalSettings;

    if (!activeModules.includes(Module.COMPOUND) || !session?.premium) {
      return;
    }

    const section = Section.DEFI_COMPOUND_HISTORY;
    const currentStatus = getStatus(section);

    if (
      isLoading(currentStatus) ||
      (currentStatus === Status.LOADED && !refresh)
    ) {
      return;
    }

    const newStatus = refresh ? Status.REFRESHING : Status.LOADING;
    setStatus(newStatus, section);

    const { awaitTask } = useTasks();
    try {
      const taskType = TaskType.DEFI_COMPOUND_HISTORY;
      const { taskId } = await api.defi.fetchCompoundHistory();
      const { result } = await awaitTask<CompoundHistory, TaskMeta>(
        taskId,
        taskType,
        {
          title: i18n.tc('actions.defi.compound_history.task.title'),
          numericKeys: balanceKeys
        }
      );

      commit('compoundHistory', result);
    } catch (e: any) {
      const { notify } = useNotifications();
      notify({
        title: i18n.tc('actions.defi.compound_history.error.title'),
        message: i18n.tc(
          'actions.defi.compound_history.error.description',
          undefined,
          {
            error: e.message
          }
        ),
        display: true
      });
    }
    setStatus(Status.LOADED, section);
  },

  async fetchAirdrops({ commit }, refresh: boolean = false) {
    const section = Section.DEFI_AIRDROPS;
    const currentStatus = getStatus(section);

    if (
      isLoading(currentStatus) ||
      (currentStatus === Status.LOADED && !refresh)
    ) {
      return;
    }

    const newStatus = refresh ? Status.REFRESHING : Status.LOADING;
    setStatus(newStatus, section);
    const { awaitTask } = useTasks();

    try {
      const { taskId } = await api.airdrops();
      const { result } = await awaitTask<Airdrops, TaskMeta>(
        taskId,
        TaskType.DEFI_AIRDROPS,
        {
          title: i18n.t('actions.defi.airdrops.task.title').toString(),
          numericKeys: balanceKeys
        }
      );

      commit('airdrops', result);
    } catch (e: any) {
      const { notify } = useNotifications();
      notify({
        title: i18n.t('actions.defi.airdrops.error.title').toString(),
        message: i18n
          .t('actions.defi.airdrops.error.description', {
            error: e.message
          })
          .toString(),
        display: true
      });
    }
    setStatus(Status.LOADED, section);
  },

  async [ACTION_PURGE_PROTOCOL](
    { commit, dispatch },
    module: Module | typeof ALL_MODULES
  ) {
    const { resetStatus } = getStatusUpdater(Section.DEFI_DSR_BALANCES);
    const { reset: resetYearn } = useYearnStore();
    const { reset: resetBalancer } = useBalancerStore();

    function clearDSRState() {
      commit('dsrBalances', {
        currentDsr: Zero,
        balances: {}
      } as DSRBalances);
      commit('dsrHistory', {});
      resetStatus(Section.DEFI_DSR_BALANCES);
      resetStatus(Section.DEFI_DSR_HISTORY);
    }

    function clearMakerDAOVaultState() {
      commit('makerDAOVaults', []);
      commit('makerDAOVaultDetails', []);
      resetStatus(Section.DEFI_MAKERDAO_VAULTS);
      resetStatus(Section.DEFI_MAKERDAO_VAULT_DETAILS);
    }

    function clearAaveState() {
      commit('aaveBalances', {});
      commit('aaveHistory', {});
      resetStatus(Section.DEFI_AAVE_BALANCES);
      resetStatus(Section.DEFI_AAVE_HISTORY);
    }

    function clearCompoundState() {
      commit('compoundBalances', {});
      commit('compoundHistory', defaultCompoundHistory());
      resetStatus(Section.DEFI_COMPOUND_BALANCES);
      resetStatus(Section.DEFI_COMPOUND_HISTORY);
    }

    function clearUniswapState() {
      commit('uniswapBalances', {});
      commit('uniswapTrades', {});
      commit('uniswapEvents', {});

      resetStatus(Section.DEFI_UNISWAP_BALANCES);
      resetStatus(Section.DEFI_UNISWAP_TRADES);
      resetStatus(Section.DEFI_UNISWAP_EVENTS);
    }

    if (module === Module.MAKERDAO_DSR) {
      clearDSRState();
    } else if (module === Module.MAKERDAO_VAULTS) {
      clearMakerDAOVaultState();
    } else if (module === Module.AAVE) {
      clearAaveState();
    } else if (module === Module.COMPOUND) {
      clearCompoundState();
    } else if (module === Module.YEARN) {
      resetYearn(ProtocolVersion.V1);
    } else if (module === Module.YEARN_V2) {
      resetYearn(ProtocolVersion.V2);
    } else if (module === Module.UNISWAP) {
      clearUniswapState();
    } else if (module === Module.BALANCER) {
      resetBalancer();
    } else if (Module.SUSHISWAP) {
      dispatch('sushiswap/purge');
    } else if (Module.LIQUITY) {
      useLiquityStore().purge();
    } else if (module === ALL_MODULES) {
      clearDSRState();
      clearMakerDAOVaultState();
      clearAaveState();
      clearCompoundState();
      resetYearn();
      clearUniswapState();
      resetBalancer();
    }
  }
};
