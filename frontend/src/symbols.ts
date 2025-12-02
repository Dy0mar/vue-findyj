import type { InjectionKey } from "vue";
import type { Bus } from "src/bus";

export const EmitterKey: InjectionKey<Bus> = Symbol("emitter");
