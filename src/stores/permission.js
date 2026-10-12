import { defineStore } from 'pinia'
import { asyncRoutes, staticRoutes } from '@/router'
import router from '@/router'

// 递归过滤路由：根据角色权限
function filterAsyncRoutes(routes, roles) {
  const result = []
  routes.forEach(route => {
    const tmp = { ...route }
    if (hasPermission(roles, tmp)) {
      if (tmp.children) {
        tmp.children = filterAsyncRoutes(tmp.children, roles)
      }
      result.push(tmp)
    }
  })
  return result
}

function hasPermission(roles, route) {
  if (route.meta && route.meta.roles) {
    return roles.some(role => route.meta.roles.includes(role))
  }
  return true // 没有配置 roles 则默认放行
}

export const usePermissionStore = defineStore('permission', {
  state: () => ({
    routes: [], // 完整路由（静态 + 动态）
    addRoutes: [] // 动态添加的路由
  }),

  getters: {
    // 侧边栏菜单：只包含有 children 的父路由 + 非隐藏路由
    sidebarRoutes: (state) => {
      return state.routes.filter(route => {
        return !route.meta?.hidden && route.children?.length > 0
      })
    }
  },

  actions: {
    // 生成动态路由
    generateRoutes(roles) {
      return new Promise(resolve => {
        const accessedRoutes = filterAsyncRoutes(asyncRoutes, roles)
        this.addRoutes = accessedRoutes
        this.routes = [...staticRoutes, ...accessedRoutes]
        resolve(accessedRoutes)
      })
    },

    // 动态添加路由
    addDynamicRoutes() {
      this.addRoutes.forEach(route => {
        router.addRoute(route)
      })
    }
  }
})
