import { defineStore } from 'pinia'
import { login as loginApi, getUserInfo } from '@/api/auth'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    userInfo: JSON.parse(localStorage.getItem('userInfo') || 'null'),
    roles: JSON.parse(localStorage.getItem('roles') || '[]')
  }),

  getters: {
    isLoggedIn: (state) => !!state.token,
    username: (state) => state.userInfo?.username || '未登录',
    avatar: (state) => state.userInfo?.avatar || '',
    roleName: (state) => {
      const roleMap = { admin: '系统管理员', operator: '操作员', viewer: '观察员' }
      return roleMap[state.roles[0]] || '未知角色'
    }
  },

  actions: {
    // 登录
    async login(loginForm) {
      const res = await loginApi(loginForm)
      if (res.code !== 200) {
        throw new Error(res.message || '登录失败')
      }
      this.token = res.data.token
      this.roles = res.data.roles
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('roles', JSON.stringify(res.data.roles))
      return res.data
    },

    // 获取用户信息
    async fetchUserInfo() {
      const { data } = await getUserInfo()
      this.userInfo = data
      this.roles = data.roles
      localStorage.setItem('userInfo', JSON.stringify(data))
      return data
    },

    // 退出登录
    logout() {
      this.token = ''
      this.userInfo = null
      this.roles = []
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
      localStorage.removeItem('roles')
      localStorage.removeItem('loginUser')
    }
  }
})
