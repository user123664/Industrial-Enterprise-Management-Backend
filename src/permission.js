import router from './router'
import { useUserStore } from '@/stores/user'
import { usePermissionStore } from '@/stores/permission'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

NProgress.configure({ showSpinner: false })

const whiteList = ['/login']

router.beforeEach(async (to, from, next) => {
  NProgress.start()

  // 设置页面标题
  document.title = to.meta?.title
    ? `${to.meta.title} - 智云工控`
    : '智云工控 - 工业企业运营管理后台'

  const userStore = useUserStore()
  const hasToken = userStore.token

  if (hasToken) {
    if (to.path === '/login') {
      next({ path: '/' })
      NProgress.done()
    } else {
      // 检查是否已加载动态路由
      const permissionStore = usePermissionStore()
      if (permissionStore.routes.length === 0) {
        try {
          // 获取用户信息（每次首次进入都重新获取，确保 roles 正确）
          await userStore.fetchUserInfo()
          // 获取角色对应的动态路由
          const roles = userStore.roles.length ? userStore.roles : ['viewer']
          const accessRoutes = await permissionStore.generateRoutes(roles)
          // 动态添加路由
          accessRoutes.forEach(route => {
            router.addRoute(route)
          })
          // 重新导航，确保新路由生效
          next({ ...to, replace: true })
        } catch (error) {
          console.error('路由守卫异常:', error)
          userStore.logout()
          next('/login')
          NProgress.done()
        }
      } else {
        next()
      }
    }
  } else {
    // 无 token
    if (whiteList.includes(to.path)) {
      next()
    } else {
      next(`/login?redirect=${to.path}`)
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  NProgress.done()
})
