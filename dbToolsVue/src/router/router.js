import { createMemoryHistory, createRouter } from 'vue-router'

import LoginPage from '../pages/LoginPage.vue'
import ProceduresPage from '../pages/ProceduresPage.vue'

const routes = [
  { path: '/', component: LoginPage },
  { path: '/Procedures', component: ProceduresPage},
]

const router = createRouter({
  history: createMemoryHistory(),
  routes,
})

export default router