import { useUserStore } from '@/stores/user'

// 按钮级权限指令 v-permission="'add'"
// 用法：<el-button v-permission="'add'">新增</el-button>
// 需配合路由 meta.permissions 使用，这里简化为按角色控制
export function setupPermissionDirective(app) {
  app.directive('permission', {
    mounted(el, binding) {
      const userStore = useUserStore()
      const roles = userStore.roles
      const requiredRole = binding.value

      if (requiredRole && !roles.includes(requiredRole)) {
        el.parentNode && el.parentNode.removeChild(el)
      }
    }
  })
}

// 角色判断指令 v-role="['admin']"
export function setupRoleDirective(app) {
  app.directive('role', {
    mounted(el, binding) {
      const userStore = useUserStore()
      const roles = userStore.roles
      const requiredRoles = binding.value

      if (requiredRoles && !roles.some(r => requiredRoles.includes(r))) {
        el.parentNode && el.parentNode.removeChild(el)
      }
    }
  })
}
