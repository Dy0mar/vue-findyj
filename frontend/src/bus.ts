import mitt, { type Emitter } from "mitt";

export const enum EventNames {
  REFETCH_VACANCIES,
  OPEN_SETTINGS,
  COUNT_VACANCIES,
}

type BusEvents = {
  [EventNames.REFETCH_VACANCIES]: undefined;
  [EventNames.OPEN_SETTINGS]: undefined;
  [EventNames.COUNT_VACANCIES]: number;
};
export type Bus = Emitter<BusEvents>;
export const bus = mitt() as Bus;
