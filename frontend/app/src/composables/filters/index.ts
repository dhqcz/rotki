import { z } from 'zod';

export const useEmptyFilter = <F extends Object | void, M>() => ({
  filters: ref<F>(),
  matchers: computed<M[]>(() => []),
  RouteFilterSchema: z.object({}),
  updateFilter: (_filter: F) => {}
});
