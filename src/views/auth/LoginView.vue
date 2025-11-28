<script setup lang="ts">
import { ref } from "vue";
import InputText from "primevue/inputtext";
import Password from "primevue/password";
import Button from "primevue/button";
import { supabase } from "src/api/client/supabase";
import { useMessage } from "src/hooks/useMessage";

const { errorMessage } = useMessage();

const isPending = ref<boolean>(false);
const login = ref<string>();
const password = ref<string>();

/**
 * Sigh In
 */
async function sighIn() {
  if (password.value && login.value) {
    isPending.value = true;
    const { error } = await supabase.auth.signInWithPassword({
      email: login.value,
      password: password.value,
    });
    if (error) {
      errorMessage(error.name, error.message);
    } else {
      window.location.assign("/");
    }
    isPending.value = false;
  }
}
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

      <form id="form" class="flex flex-col gap-4" @submit.prevent="sighIn">
        <div class="flex flex-col gap-2">
          <label for="email">Email</label>
          <InputText
            id="email"
            v-model="login"
            type="email"
            :disabled="isPending"
            aria-placeholder="example@gmail.com"
          />
        </div>

        <div class="flex flex-col gap-2">
          <label for="password">Password</label>
          <Password input-id="password" v-model="password" :feedback="false" :disabled="isPending" toggleMask fluid />
        </div>
      </form>

      <Button label="Sign In" type="submit" form="form" :disabled="isPending" :loading="isPending" />
    </div>
  </div>
</template>
