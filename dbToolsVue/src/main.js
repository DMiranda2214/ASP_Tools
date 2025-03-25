import { createApp } from 'vue'
import router from './router/router'

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

import VueSweetalert2 from 'vue-sweetalert2';

// Components
import App from './App.vue'

const vuetify = createVuetify({
  components,
  directives,
})

const app = createApp(App)
app.use(router)
app.use(vuetify)
app.use(VueSweetalert2);
app.mount('#app')