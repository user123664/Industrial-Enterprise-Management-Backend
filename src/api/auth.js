import { mockApi } from '@/utils/mock-data'

// 登录
export function login(data) {
  return mockApi.login(data)
}

// 获取用户信息
export function getUserInfo() {
  return mockApi.getUserInfo()
}
/*

import service from '@/utils/request'

// 登录
export function login(data) {
  return service.post('/auth/login', data)
}

// 获取用户信息
export function getUserInfo() {
  return service.get('/auth/user/info')
}

*/
