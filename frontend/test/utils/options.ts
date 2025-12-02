import type { PartialDeep } from "type-fest";
import { type ComponentMountingOptions, type VueWrapper, mount } from "@vue/test-utils";
import { cloneDeep, omit, mergeWith, isObject } from "lodash";

type RenderOpts<T> = {
  delKeys?: string[];
  cbOverride?: (wrapper?: VueWrapper<ComponentMountingOptions<T>>) => Promise<void>;
};

/**
 * Wrapper for the mount function from @vue/test-utils. Allows specifying a component `comp` and mount options `defaults`.
 * sMounter because it's a sync mounter, without promises.
 * Prefer using it unless you need async callbacks.
 * @param comp - component to mount.
 * @param [defaults] - default mounting component options. Merged and overridden with provided in the inner mount function.
 */
export function sMounter<T>(comp: T, defaults?: ComponentMountingOptions<T>) {
  return function (overrides?: PartialDeep<ComponentMountingOptions<T>>, delKeys?: string[]) {
    let finalOpts = mergeWith(cloneDeep(defaults), overrides, function (a, b) {
      // Here we check if we need to merge (we have something on the left and right)
      // Note that we use the 'replace' strategy to merge the two arrays
      if (!isObject(b) || Array.isArray(b)) {
        return b;
      }

      return { ...a, ...b };
    }) as ComponentMountingOptions<T>;

    if (delKeys) {
      finalOpts = omit(finalOpts, delKeys);
    }

    return mount(comp, finalOpts);
  };
}

/**
 * Similar to sMounter but with async callback support.
 * aMounter because it's an async mounter.
 * The callback is called twice, before (without the wrapper) and after rendering (with wrapper).
 */
export function aMounter<T>(
  comp: T,
  defaults?: ComponentMountingOptions<T>,
  cb?: (wrapper?: VueWrapper<ComponentMountingOptions<T>>) => Promise<void>,
) {
  const render = sMounter(comp, defaults);
  /**
   * Mount a component with provided options.
   * @param [opts] - options to override default options. Note: if new option is `undefined` old option will be used.
   * @param [extra] - additional options
   * @param [extra.shallow] - use shallowMount instead of mount
   * @param [extra.delKeys] - keys to delete from options after merging
   */
  return async (opts?: PartialDeep<ComponentMountingOptions<T>>, extra?: RenderOpts<T>) => {
    const callback = async (w?: VueWrapper<ComponentMountingOptions<T>>) => {
      await (extra?.cbOverride ? extra?.cbOverride(w) : cb?.(w));
    };
    await callback();
    const wrapper = render(opts, extra?.delKeys);
    await callback(wrapper);
    return wrapper;
  };
}
