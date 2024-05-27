import {createRouter, createWebHistory} from 'vue-router'
import Login from "@/views/Login.vue";
import Info from "@/views/Info.vue";
import bdMap from "@/views/bdMap.vue";
import Header from "@/components/Header.vue";
import UserDetail from "@/views/UserDetail.vue";
import POIMap from "@/views/POIMap.vue";
import Convert from "@/views/Convert.vue";

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            redirect: '/login',
            component: Header,
            children: [
                {
                    path: 'map',
                    name: 'map',
                    component: bdMap,
                    meta: {
                        requireAuth: true
                    }
                },
                {
                    path: 'poi',
                    name: 'poi',
                    component: POIMap,
                    meta: {
                        requireAuth: true
                    }
                },
                {
                    path: "info",
                    name: "info",
                    component: Info,
                    meta: {
                        requireAuth: true
                    }
                },
                {
                    path: "userDetail/:id",  // userDetail/id
                    name: "userDetail",
                    component: UserDetail,
                    meta: {
                        requireAuth: true
                    }
                },
                {
                    path: "convert",
                    name: "convert",
                    component: Convert,
                    meta: {
                        requireAuth: true
                    }
                }
            ]
        },
        {
            path: '/login',
            name: 'login',
            component: Login,
            meta: {
                requireAuth: false // 不需要鉴权
            }
        },
        {
            path:'/:pathMatch(.*)*',
            redirect:'/404',
            meta: {
                requireAuth: false
            }

        },
        {
            path:'/404',
            name:'404',
            component: ()=>import('@/views/404.vue'),
            meta: {
                requireAuth: false
            }

        }
    ]
})

router.beforeEach((to, from, next) => {
    if (to.path === '/login' && localStorage.getItem('token')) {
        next('/map')
    }
    // 判断该路由是否需要登录权限
    if (to.meta.requireAuth) {
        // 该路由需要登录权限
        if (localStorage.getItem('token')) {
            // 已登录
            next()
        } else {
            next('/login')
        }
    } else {
        next()
    }
});

// 在导航守卫之后添加滚动控制逻辑
router.afterEach((to, from) => {
    // 加了一个禁用/启用网页滚动的功能
    if (to.path === '/poi' || to.path === '/map') {
        document.body.style.overflow = 'hidden';
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0; // 针对不同浏览器的兼容性
    } else {
        document.body.style.overflow = 'auto';
    }
});

export default router
