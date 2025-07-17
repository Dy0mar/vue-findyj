<script setup lang="ts">
import { ref, watch } from "vue";
import { useMutation } from "@tanstack/vue-query";
import PInputText from "primevue/inputtext";
import PPassword from "primevue/password";
import PButton from "primevue/button";
import type { SignInOptions } from "src/types/models/auth";
import { supabase } from "src/api/client/supabase";
import { authQuery } from "src/api/query/auth";
import { useMessage } from "src/hooks/useMessage";

const { errorMessage } = useMessage();

const login = ref<SignInOptions["login"]>();
const password = ref<SignInOptions["password"]>();

const { data, mutateAsync, isPending, error, isSuccess } = useMutation(authQuery.login());

/**
 * @description Submit handler
 */
async function onSubmit() {
  if (password.value && login.value) {
    if (supabase) {
      const { error } = await supabase.auth.signInWithPassword({
        email: login.value,
        password: password.value,
      });
      if (error) {
        errorMessage(error.name, error.message);
      } else {
        window.location.assign("/");
      }
    } else {
      await mutateAsync({ password: password.value, login: login.value });
    }
  }
}

watch(error, (value) => {
  if (value) {
    errorMessage(value.name, value.message);
  }
});

watch([isSuccess, data], ([ok, value]) => {
  if (ok && value) {
    localStorage.setItem("token", value);
    window.location.assign("/");
  }
});
</script>

<template>
  <div
    class="border dark:border-surface-700 dark:bg-surface-900 rounded-2x p-4 md:px-10 md:pt-10 md:pb-16 z-10 rounded-3xl"
  >
    <div class="flex flex-col gap-10 md:min-w-[460px] text-surface-50">
      <div>
        <div class="font-bold text-surface-50 text-2xl">Sign in</div>
        <div class="text-surface-500">Enter the data</div>
      </div>

      <form id="form" class="flex flex-col gap-4" @submit.prevent="onSubmit">
        <div class="flex flex-col gap-2">
          <template v-if="supabase">
            <label for="email">Email</label>
            <PInputText
              id="email"
              v-model="login"
              type="email"
              :disabled="isPending"
              aria-placeholder="example@gmail.com"
            />
          </template>
          <template v-else>
            <label for="login">Login</label>
            <PInputText id="login" v-model="login" :disabled="isPending" aria-placeholder="some hache here dude" />
          </template>
        </div>

        <div class="flex flex-col gap-2">
          <label for="password">Password</label>
          <PPassword input-id="password" v-model="password" :feedback="false" :disabled="isPending" toggleMask fluid />
        </div>
      </form>

      <PButton label="Sign In" type="submit" form="form" :disabled="isPending" :loading="isPending" />
    </div>
  </div>
</template>
