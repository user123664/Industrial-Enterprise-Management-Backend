import { mockApi } from '@/utils/mock-data'

// 获取工单列表
export function getWorkorderList(params) {
  return mockApi.getWorkorders(params)
}

// 新增工单
export function addWorkorder(data) {
  return mockApi.addWorkorder(data)
}

// 修改工单
export function updateWorkorder(data) {
  return mockApi.updateWorkorder(data)
}

// 删除工单
export function deleteWorkorder(id) {
  return mockApi.deleteWorkorder(id)
}
