import { useAuthStore } from '@/stores/auth'
import { createRouter, createWebHistory } from 'vue-router'

export enum RoutePrefix {
    Auth = '/auth',
    Admin = '/admin',
    Default = ''
}

export enum RoutePath {
    Home = RoutePrefix.Default + '/',
    About = RoutePrefix.Default + '/about',
    NotFound = RoutePrefix.Default + '/404',
    /*******/
    Login = RoutePrefix.Auth + '/login',
    Register = RoutePrefix.Auth + '/register',
    /*******/
    AdminProductSub = RoutePrefix.Admin + '/product',
    AdminProductSub1 = RoutePrefix.Admin + '/product/sub1',
    AdminProductSub2 = RoutePrefix.Admin + '/product/sub2',

    AdminCategorySub = RoutePrefix.Admin + '/category',
    AdminCategorySub1 = RoutePrefix.Admin + '/category/sub1',
    AdminCategorySub2 = RoutePrefix.Admin + '/category/sub2',

    Admincategory = RoutePrefix.Admin + '/category',
    AdminTab3 = RoutePrefix.Admin + '/tab3'
}

export const PUBLIC_ROUTE_PATHS: string[] = [
    RoutePath.Login,
    RoutePath.Register,
    RoutePath.Home,
    RoutePath.About,
    RoutePath.NotFound
]

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: RoutePrefix.Default,
            children: [
                {
                    path: RoutePath.Home,
                    name: 'home',
                    component: () => import('../views/home/index.vue'),
                    meta: {
                        layout: 'landing-page'
                    }
                },
                {
                    path: RoutePath.About,
                    name: 'About',
                    component: () => import('../views/home/index.vue'),
                    meta: {
                        layout: 'landing-page'
                    }
                },
                {
                    path: RoutePath.NotFound,
                    name: '404',
                    component: () => import('../views/404/index.vue'),
                    meta: {
                        title: '404'
                    }
                }
            ]
        },
        {
            path: RoutePrefix.Auth,
            meta: {
                layout: 'auth'
            },
            children: [
                {
                    path: RoutePath.Login,
                    name: 'Login',
                    component: () => import('../views/login/index.vue'),
                    meta: {
                        title: 'Đăng nhập'
                    }
                },
                {
                    path: RoutePath.Register,
                    name: 'Register',
                    component: () => import('../views/register/index.vue'),
                    meta: {
                        title: 'Đăng ký'
                    }
                }
            ]
        },
        {
            path: RoutePrefix.Admin,
            meta: {
                layout: 'admin'
            },
            redirect: RoutePath.AdminProductSub,
            children: [
                {
                    path: RoutePath.AdminProductSub,
                    name: 'AdminTabSub',
                    component: () => import('../views/admin/product/index.vue'),
                    meta: {
                        title: 'Product'
                    }
                },
                {
                    path: RoutePath.AdminProductSub1,
                    name: 'AdminProductSub1',
                    component: () => import('../views/admin/product/sub1/index.vue'),
                    meta: {
                        title: 'Add Product'
                    }
                },
                {
                    path: `${RoutePath.AdminProductSub2}/:id`,
                    name: 'AdminProductSub2',
                    component: () => import('../views/admin/product/sub2/index.vue'),
                    meta: { title: 'Edit Product' }
                },
                {
                    path: RoutePath.AdminCategorySub,
                    name: 'AdminTabSub2',
                    component: () => import('../views/admin/category/index.vue'),
                    meta: {
                        title: 'Category'
                    }
                },
                {
                    path: RoutePath.AdminCategorySub1,
                    name: 'AdmincategorySub1',
                    component: () => import('../views/admin/category/sub1/index.vue'),
                    meta: {
                        title: 'Add Category'
                    }
                },
                {
                    path: `${RoutePath.AdminCategorySub2}/:id`,
                    name: 'AdmincategorySub2Edit',
                    component: () => import('../views/admin/category/sub2/index.vue'),
                    meta: { title: 'Edit Category' }
                }
                // {
                //     path: RoutePath.AdmincategorySub2,
                //     name: 'AdmincategorySub2',
                //     component: () => import('../views/admin/category/sub2/index.vue'),
                //     meta: {
                //         title: 'Edit Category'
                //     }
                // }
            ]
        }
    ]
})

router.beforeEach(async (to) => {
    console.info(':::Router -> Enter', to.path)

    if (router.resolve(to).matched.length === 0) {
        console.info(`:::Router -> '${to.path}' not found, redirect to 404 page`)
        return RoutePath.NotFound
    }

    const toAuthRequiredRoutes = !PUBLIC_ROUTE_PATHS.includes(to.path)
    const authStore = useAuthStore()

    if (toAuthRequiredRoutes && !authStore.isLoggedIn) {
        console.info(`:::Router -> '${to.path}' requires authentication, redirect to login page`)
        authStore.returnUrl = to.fullPath
        return RoutePath.Login
    }
})

export default router
