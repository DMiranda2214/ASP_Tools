import { createRouter, createWebHistory } from 'vue-router'
import LoginPages from '../components/LoginPages.vue'
import ProceduresTables from '../components/ProceduresTables.vue'

const routes = [
    { path: '/', redirect: '/login' },
    { path: '/login', name: 'Login', component: LoginPages },
    { path: '/tables', name: 'Tables', component: ProceduresTables , meta: { requiresAuth: true } }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router;