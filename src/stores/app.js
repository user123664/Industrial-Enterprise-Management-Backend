import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => ({
    sidebarCollapsed: false,
    // 标签页导航
    visitedViews: [
      {
        path: '/dashboard',
        title: '数据看板',
        name: 'Dashboard',
        affix: true
      }
    ]
  }),

  actions: {
    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed
    },

    addVisitedView(view) {
      if (this.visitedViews.some(v => v.path === view.path)) return
      this.visitedViews.push({
        path: view.path,
        title: view.meta?.title || '未命名',
        name: view.name,
        affix: view.meta?.affix
      })
    },

    removeVisitedView(view) {
      const index = this.visitedViews.findIndex(v => v.path === view.path)
      if (index > -1) {
        this.visitedViews.splice(index, 1)
      }
      return this.visitedViews
    },

    removeOtherViews(view) {
      this.visitedViews = this.visitedViews.filter(v => v.affix || v.path === view.path)
    },

    removeAllViews() {
      this.visitedViews = this.visitedViews.filter(v => v.affix)
    }
  }
})
