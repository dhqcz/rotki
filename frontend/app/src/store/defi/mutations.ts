import { AaveBalances, AaveHistory } from '@rotki/common/lib/defi/aave';
import { MutationTree } from 'vuex';
import {
  CompoundBalances,
  CompoundHistory
} from '@/services/defi/types/compound';
import { defaultState } from '@/store/defi/state';
import {
  Airdrops,
  AllDefiProtocols,
  DefiState,
  DSRBalances,
  DSRHistory,
  MakerDAOVault,
  MakerDAOVaultDetails
} from '@/store/defi/types';

export const mutations: MutationTree<DefiState> = {
  dsrHistory(state: DefiState, history: DSRHistory) {
    state.dsrHistory = history;
  },
  dsrBalances(state: DefiState, balances: DSRBalances) {
    state.dsrBalances = balances;
  },
  makerDAOVaults(state: DefiState, makerDAOVaults: MakerDAOVault[]) {
    state.makerDAOVaults = makerDAOVaults;
  },
  makerDAOVaultDetails(
    state: DefiState,
    makerDAOVaultDetails: MakerDAOVaultDetails[]
  ) {
    state.makerDAOVaultDetails = makerDAOVaultDetails;
  },
  aaveBalances(state: DefiState, aaveBalances: AaveBalances) {
    state.aaveBalances = aaveBalances;
  },
  aaveHistory(state: DefiState, aaveHistory: AaveHistory) {
    state.aaveHistory = aaveHistory;
  },
  allDefiProtocols(state: DefiState, allProtocols: AllDefiProtocols) {
    state.allProtocols = allProtocols;
  },
  compoundBalances(state: DefiState, balances: CompoundBalances) {
    state.compoundBalances = balances;
  },
  compoundHistory(state: DefiState, history: CompoundHistory) {
    state.compoundHistory = history;
  },
  airdrops(state: DefiState, airdrops: Airdrops) {
    state.airdrops = airdrops;
  },
  reset(state: DefiState) {
    Object.assign(state, defaultState());
  }
};
