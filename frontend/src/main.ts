import { createApp } from "vue";

import "src/assets/tailwind.css";
import { VueQueryPlugin } from "@tanstack/vue-query";
import PrimeVue from "primevue/config";
import Ripple from "primevue/ripple";
import ToastService from "primevue/toastservice";
import ConfirmationService from "primevue/confirmationservice";

import { FTheme } from "src/themes/f-theme";
import { bus } from "src/bus";
import { EmitterKey } from "src/symbols";
import { queryClient } from "src/queryClient";
import router from "src/router";
import App from "src/App.vue";
import "primeicons/primeicons.css";
import "src/prototype";

const app = createApp(App);
app.use(router);
app.use(VueQueryPlugin, { queryClient });
app.use(PrimeVue, FTheme);
app.use(ToastService);
app.use(ConfirmationService);

app.provide(EmitterKey, bus);
app.directive("ripple", Ripple);

app.mount("#app");
