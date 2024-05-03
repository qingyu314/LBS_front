import { createRouter, createWebHistory } from 'vue-router'
import Layout from "@/layout/Layout.vue";
import Login from "@/views/Login.vue";
import Register from "@/views/Register.vue";
import Info from "@/views/Info.vue";
import bdMap from "@/views/bdMap.vue";
import mapPoint from "@/views/mapPoint.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      redirect: '/login',
      component: Layout,
      children:[
        {
          path: 'map',
          name: 'map',
          component: bdMap
        },
        {
          path: 'mapPoint',
          name: 'mapPoint',
          component: mapPoint
        },
      ]
    },
    {
      path: '/login',
      name: 'login',
      component: Login
    },
    {
      path: '/register',
      name: 'register',
      component: Register
    },
    {
      path: "/info",
      name: "info",
      component: Info
    }
  ]
})

export default router
