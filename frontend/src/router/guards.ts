import type { NavigationGuard } from "vue-router";
import { Names } from "src/router/names";
import { supabase } from "src/api/client/supabase";

const useSession = async () => {
  const r = await supabase.auth.getSession();
  return r.data.session;
};

export const before: NavigationGuard[] = [
  /**
   * redirect to auth when no authenticated
   */
  async (to, from, next) => {
    const session = await useSession();

    if (!to.path.startsWith("/auth") && !session) {
      next({ name: Names.AUTH.INDEX });
    } else {
      next();
    }
  },

  /**
   * redirect to home from auth page when authenticated
   */
  async (to, from, next) => {
    const session = await useSession();

    if (to.path.startsWith("/auth") && session) {
      next({ name: Names.HOME.INDEX });
    } else {
      next();
    }
  },
];
