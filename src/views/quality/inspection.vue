<template>
  <div class="page-container">
    <!-- 统计卡片 -->
    <el-row :gutter="16" class="stats-row">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <el-icon :size="32" color="#52c41a"><CircleCheck /></el-icon>
            <div>
              <div class="stat-value">{{ stats.passRate }}%</div>
              <div class="stat-label">合格率</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <el-icon :size="32" color="#ff4d4f"><CircleClose /></el-icon>
            <div>
              <div class="stat-value">{{ stats.failRate }}%</div>
              <div class="stat-label">不合格率</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <el-icon :size="32" color="#1a73e8"><Document /></el-icon>
            <div>
              <div class="stat-value">{{ stats.totalInspections }}</div>
              <div class="stat-label">检测总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <el-icon :size="32" color="#faad14"><Warning /></el-icon>
            <div>
              <div class="stat-value">{{ stats.totalDefects }}</div>
              <div class="stat-label">不良品总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区 -->
    <el-row :gutter="16" class="chart-row">
      <el-col :span="14">
        <el-card shadow="hover">
          <template #header><span>合格率趋势</span></template>
          <div ref="trendChartRef" class="chart-box" />
        </el-card>
      </el-col>
      <el-col :span="10">
        <el-card shadow="hover">
          <template #header><span>不良品类型分布</span></template>
          <div ref="pieChartRef" class="chart-box" />
        </el-card>
      </el-col>
    </el-row>

    <!-- 报告列表 -->
    <el-card shadow="never" class="app-card">
      <div class="filter-bar">
        <el-input
          v-model="filters.keyword"
          placeholder="产品/批次号"
          clearable
          style="width: 200px"
          @keyup.enter="handleSearch"
        />
        <el-select v-model="filters.result" placeholder="检测结果" clearable style="width: 120px">
          <el-option v-for="r in resultOptions" :key="r" :label="r" :value="r" />
        </el-select>
        <el-button type="primary" @click="handleSearch">
          <el-icon><Search /></el-icon> 查询
        </el-button>
      </div>

      <el-table :data="tableData" v-loading="loading" border stripe>
        <el-table-column prop="code" label="报告编号" width="100" />
        <el-table-column prop="productName" label="产品" width="140" />
        <el-table-column prop="batchNo" label="批次号" width="140" />
        <el-table-column prop="inspectItem" label="检测项目" width="110" />
        <el-table-column prop="value" label="检测值" width="90" />
        <el-table-column prop="standard" label="标准" width="90" />
        <el-table-column label="结果" width="90">
          <template #default="{ row }">
            <el-tag :type="getResultTag(row.result)" effect="dark">{{ row.result }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="inspector" label="检测员" width="80" />
        <el-table-column prop="inspectDate" label="检测日期" width="110" />
        <el-table-column prop="remark" label="备注" min-width="150" />
      </el-table>

      <div class="table-footer">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          background
          @size-change="fetchData"
          @current-change="fetchData"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import { getInspectionList, getQualityStats } from '@/api/quality'

const loading = ref(false)
const tableData = ref([])
const trendChartRef = ref()
const pieChartRef = ref()
const resultOptions = ['合格', '不合格', '待复检']

let trendChart = null
let pieChart = null

const filters = reactive({ keyword: '', result: '' })
const pagination = reactive({ page: 1, pageSize: 10, total: 0 })
const stats = reactive({ passRate: 0, failRate: 0, totalInspections: 0, totalDefects: 0 })

function getResultTag(result) {
  const map = { '合格': 'success', '不合格': 'danger', '待复检': 'warning' }
  return map[result] || 'info'
}

// 加载统计数据和图表
async function loadStats() {
  const { data } = await getQualityStats()
  Object.assign(stats, data)

  await nextTick()
  renderTrendChart(data.trend)
  renderPieChart(data.defectTypes)
}

function renderTrendChart(trend) {
  if (!trendChart) trendChart = echarts.init(trendChartRef.value)
  trendChart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { data: ['合格率', '不合格率'], bottom: 0 },
    grid: { top: 30, left: 45, right: 20, bottom: 40 },
    xAxis: { type: 'category', data: trend.map(d => d.date), axisLabel: { color: '#666' } },
    yAxis: { type: 'value', max: 100, axisLabel: { formatter: '{value}%', color: '#666' }, splitLine: { lineStyle: { color: '#f0f0f0' } } },
    series: [
      { name: '合格率', type: 'line', smooth: true, data: trend.map(d => d.pass), itemStyle: { color: '#52c41a' }, areaStyle: { color: 'rgba(82, 196, 26, 0.2)' } },
      { name: '不合格率', type: 'line', smooth: true, data: trend.map(d => d.fail), itemStyle: { color: '#ff4d4f' } }
    ]
  })
}

function renderPieChart(defects) {
  if (!pieChart) pieChart = echarts.init(pieChartRef.value)
  pieChart.setOption({
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { bottom: 0, icon: 'circle' },
    series: [{
      type: 'pie',
      radius: ['35%', '60%'],
      center: ['50%', '45%'],
      itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
      label: { show: false },
      data: defects,
      color: ['#1a73e8', '#52c41a', '#faad14', '#ff4d4f']
    }]
  })
}

async function fetchData() {
  loading.value = true
  try {
    const { data } = await getInspectionList({
      page: pagination.page,
      pageSize: pagination.pageSize,
      keyword: filters.keyword,
      result: filters.result
    })
    tableData.value = data.list
    pagination.total = data.total
  } finally {
    loading.value = false
  }
}

function handleSearch() { pagination.page = 1; fetchData() }

function handleResize() {
  trendChart?.resize()
  pieChart?.resize()
}

onMounted(() => {
  loadStats()
  fetchData()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  trendChart?.dispose()
  pieChart?.dispose()
})
</script>

<style lang="scss" scoped>
.stats-row { margin-bottom: 16px; }

.stat-card {
  .stat-content {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .stat-value { font-size: 24px; font-weight: 700; color: #303133; }
  .stat-label { font-size: 13px; color: #909399; margin-top: 2px; }
}

.chart-row { margin-bottom: 16px; }
.chart-box { height: 260px; }
.table-footer { display: flex; justify-content: flex-end; margin-top: 16px; }
</style>
