import { mockApi } from '@/utils/mock-data'

// 获取检测报告列表
export function getInspectionList(params) {
  return mockApi.getInspections(params)
}

// 获取质量统计
export function getQualityStats() {
  return mockApi.getQualityStats()
}
