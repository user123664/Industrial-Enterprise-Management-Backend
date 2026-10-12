import { createRouter, createWebHashHistory } from 'vue-router'

// 静态路由：不需要权限
export const staticRoutes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '登录', hidden: true }
  },
  {
    path: '/',
    component: () => import('@/layout/index.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: { title: '数据看板', icon: 'Odometer', affix: true }
      }
    ]
  },
  {
    path: '/404',
    name: 'NotFound',
    component: () => import('@/views/error/404.vue'),
    meta: { title: '页面不存在', hidden: true }
  }
]

// 动态路由：根据角色权限加载
export const asyncRoutes = [
  {
    path: '/equipment',
    component: () => import('@/layout/index.vue'),
    redirect: '/equipment/list',
    meta: { title: '设备管理', icon: 'Setting', roles: ['admin', 'operator'] },
    children: [
      {
        path: 'list',
        name: 'EquipmentList',
        component: () => import('@/views/equipment/list.vue'),
        meta: { title: '设备列表', icon: 'List', roles: ['admin', 'operator'] }
      },
      {
        path: 'maintenance',
        name: 'EquipmentMaintenance',
        component: () => import('@/views/equipment/maintenance.vue'),
        meta: { title: '维护记录', icon: 'Tools', roles: ['admin', 'operator'] }
      }
    ]
  },
  {
    path: '/workorder',
    component: () => import('@/layout/index.vue'),
    redirect: '/workorder/list',
    meta: { title: '工单管理', icon: 'Document', roles: ['admin', 'operator', 'viewer'] },
    children: [
      {
        path: 'list',
        name: 'WorkorderList',
        component: () => import('@/views/workorder/list.vue'),
        meta: { title: '工单列表', icon: 'Tickets', roles: ['admin', 'operator', 'viewer'] }
      }
    ]
  },
  {
    path: '/quality',
    component: () => import('@/layout/index.vue'),
    redirect: '/quality/inspection',
    meta: { title: '质量检测', icon: 'Checked', roles: ['admin', 'operator'] },
    children: [
      {
        path: 'inspection',
        name: 'QualityInspection',
        component: () => import('@/views/quality/inspection.vue'),
        meta: { title: '检测报告', icon: 'Document', roles: ['admin', 'operator'] }
      }
    ]
  },
  {
    path: '/personnel',
    component: () => import('@/layout/index.vue'),
    redirect: '/personnel/list',
    meta: { title: '人员管理', icon: 'User', roles: ['admin'] },
    children: [
      {
        path: 'list',
        name: 'PersonnelList',
        component: () => import('@/views/personnel/list.vue'),
        meta: { title: '员工列表', icon: 'UserFilled', roles: ['admin'] }
      }
    ]
  },
  {
    path: '/system',
    component: () => import('@/layout/index.vue'),
    redirect: '/system/role',
    meta: { title: '系统设置', icon: 'Tools', roles: ['admin'] },
    children: [
      {
        path: 'role',
        name: 'SystemRole',
        component: () => import('@/views/system/role.vue'),
        meta: { title: '角色管理', icon: 'UserFilled', roles: ['admin'] }
      },
      {
        path: 'log',
        name: 'SystemLog',
        component: () => import('@/views/system/log.vue'),
        meta: { title: '操作日志', icon: 'Notebook', roles: ['admin'] }
      }
    ]
  },
  // 404 兜底路由（必须放最后）
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404',
    meta: { hidden: true }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes: staticRoutes,
  scrollBehavior: () => ({ top: 0 })
})

export default router
