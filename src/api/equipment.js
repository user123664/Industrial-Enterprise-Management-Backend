import { mockApi } from '@/utils/mock-data'

// 获取设备列表
export function getEquipmentList(params) {
  return mockApi.getEquipment(params)
}

// 新增设备
export function addEquipment(data) {
  return mockApi.addEquipment(data)
}

// 修改设备
export function updateEquipment(data) {
  return mockApi.updateEquipment(data)
}

// 删除设备
export function deleteEquipment(id) {
  return mockApi.deleteEquipment(id)
}

// 获取维护记录
export function getMaintenanceList(params) {
  return mockApi.getMaintenance(params)
}
