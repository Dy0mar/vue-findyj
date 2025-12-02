import { createApp } from "vue";

import "src/assets/tailwind.css";
import { VueQueryPlugin } from "@tanstack/vue-query";
import PrimeVue from "primevue/config";
import Ripple from "primevue/ripple";
import ToastService from "primevue/toastservice";

import { FTheme } from "src/themes/f-theme";
import { bus } from "src/bus";
import { EmitterKey } from "src/symbols";
import { router } from "src/router";
import { queryClient } from "src/queryClient";
import App from "src/App.vue";
import "src/prototype";

const app = createApp(App);
app.use(router);
app.use(VueQueryPlugin, { queryClient });
app.use(PrimeVue, FTheme);
app.use(ToastService);

app.provide(EmitterKey, bus);
app.directive("ripple", Ripple);

app.mount("#app");
