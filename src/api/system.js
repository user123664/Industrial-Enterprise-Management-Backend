import { mockApi } from '@/utils/mock-data'

// 获取人员列表
export function getPersonnelList(params) {
  return mockApi.getPersonnel(params)
}

// 新增人员
export function addPersonnel(data) {
  return mockApi.addPersonnel(data)
}

// 修改人员
export function updatePersonnel(data) {
  return mockApi.updatePersonnel(data)
}

// 删除人员
export function deletePersonnel(id) {
  return mockApi.deletePersonnel(id)
}

// 获取角色列表
export function getRoleList() {
  return mockApi.getRoles()
}

// 新增角色
export function addRole(data) {
  return mockApi.addRole(data)
}

// 修改角色
export function updateRole(data) {
  return mockApi.updateRole(data)
}

// 删除角色
export function deleteRole(id) {
  return mockApi.deleteRole(id)
}

// 获取操作日志
export function getLogList(params) {
  return mockApi.getLogs(params)
}
