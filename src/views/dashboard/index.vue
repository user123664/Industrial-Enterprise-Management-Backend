<template>
  <div class="dashboard">
    <!-- 概览卡片 -->
    <div class="overview-cards">
      <el-card
        v-for="item in overviewData"
        :key="item.key"
        class="overview-card"
        shadow="hover"
        :body-style="{ padding: '20px' }"
      >
        <div class="card-inner">
          <div class="card-left">
            <div class="card-value">
              <span class="value">{{ item.value }}</span>
              <span class="unit">{{ item.unit }}</span>
            </div>
            <div class="card-label">{{ item.label }}</div>
          </div>
          <div class="card-right">
            <el-icon :size="36" :color="item.color">
              <component :is="item.icon" />
            </el-icon>
          </div>
        </div>
        <div class="card-trend" :class="item.trend > 0 ? 'up' : 'down'">
          <el-icon><component :is="item.trend > 0 ? 'CaretTop' : 'CaretBottom'" /></el-icon>
          {{ Math.abs(item.trend) }}%
          <span class="trend-label">较昨日</span>
        </div>
      </el-card>
    </div>

    <!-- 图表区域 -->
    <el-row :gutter="20" class="chart-row">
      <el-col :span="16">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <div class="card-header">
              <span>近 7 日产量趋势</span>
              <el-radio-group v-model="trendType" size="small">
                <el-radio-button value="output">产量</el-radio-button>
                <el-radio-button value="defect">不良品</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div ref="trendChartRef" class="chart-box" />
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <span>设备状态分布</span>
          </template>
          <div ref="pieChartRef" class="chart-box" />
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="chart-row">
      <el-col :span="12">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <span>各车间产能对比</span>
          </template>
          <div ref="barChartRef" class="chart-box" />
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <div class="card-header">
              <span>实时告警</span>
              <el-tag type="danger" size="small">{{ alerts.length }} 条</el-tag>
            </div>
          </template>
          <div class="alert-list">
            <div
              v-for="(alert, index) in alerts"
              :key="index"
              class="alert-item"
            >
              <el-tag
                :type="alert.level === 'danger' ? 'danger' : alert.level === 'warning' ? 'warning' : 'info'"
                size="small"
                effect="dark"
              >
                {{ alert.level === 'danger' ? '紧急' : alert.level === 'warning' ? '警告' : '通知' }}
              </el-tag>
              <span class="alert-title">{{ alert.title }}</span>
              <span class="alert-time">{{ alert.time }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, watch, nextTick } from 'vue'
import * as echarts from 'echarts'
import { getDashboardData } from '@/api/dashboard'

const trendChartRef = ref()
const pieChartRef = ref()
const barChartRef = ref()
const trendType = ref('output')

let trendChart = null
let pieChart = null
let barChart = null

const dashboardData = reactive({
  overview: {},
  productionTrend: [],
  equipmentStatus: [],
  workshopComparison: [],
  alerts: []
})

const overviewData = ref([])
const alerts = ref([])

// 加载数据
async function loadData() {
  const { data } = await getDashboardData()
  Object.assign(dashboardData, data)

  overviewData.value = [
    {
      key: 'output',
      label: '今日产量',
      value: data.overview.output.value,
      unit: data.overview.output.unit,
      trend: data.overview.output.trend,
      color: '#1a73e8',
      icon: 'Goods'
    },
    {
      key: 'equipment',
      label: '设备在线',
      value: `${data.overview.equipmentOnline.value}/${data.overview.equipmentOnline.total}`,
      unit: '台',
      trend: data.overview.equipmentOnline.trend,
      color: '#52c41a',
      icon: 'Monitor'
    },
    {
      key: 'workorder',
      label: '活跃工单',
      value: data.overview.workorderActive.value,
      unit: '个',
      trend: data.overview.workorderActive.trend,
      color: '#faad14',
      icon: 'Document'
    },
    {
      key: 'passRate',
      label: '合格率',
      value: data.overview.passRate.value,
      unit: data.overview.passRate.unit,
      trend: data.overview.passRate.trend,
      color: '#ff4d4f',
      icon: 'Select'
    }
  ]
  alerts.value = data.alerts

  await nextTick()
  renderTrendChart()
  renderPieChart()
  renderBarChart()
}

// 产量趋势图
function renderTrendChart() {
  if (!trendChart) trendChart = echarts.init(trendChartRef.value)

  const trend = dashboardData.productionTrend
  const isOutput = trendType.value === 'output'

  trendChart.setOption({
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    legend: {
      data: isOutput ? ['实际产量', '目标产量'] : ['不良品'],
      bottom: 0
    },
    grid: { top: 30, left: 50, right: 20, bottom: 40 },
    xAxis: {
      type: 'category',
      data: trend.map(d => d.date),
      axisLine: { lineStyle: { color: '#e0e0e0' } },
      axisLabel: { color: '#666' }
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisLabel: { color: '#666' },
      splitLine: { lineStyle: { color: '#f0f0f0' } }
    },
    series: isOutput
      ? [
          {
            name: '实际产量',
            type: 'line',
            smooth: true,
            data: trend.map(d => d.output),
            itemStyle: { color: '#1a73e8' },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(26, 115, 232, 0.3)' },
                { offset: 1, color: 'rgba(26, 115, 232, 0)' }
              ])
            }
          },
          {
            name: '目标产量',
            type: 'line',
            smooth: true,
            data: trend.map(d => d.target),
            itemStyle: { color: '#faad14' },
            lineStyle: { type: 'dashed' }
          }
        ]
      : [
          {
            name: '不良品',
            type: 'bar',
            data: trend.map(d => d.defect),
            itemStyle: { color: '#ff4d4f', borderRadius: [4, 4, 0, 0] }
          }
        ]
  })
}

// 设备状态饼图
function renderPieChart() {
  if (!pieChart) pieChart = echarts.init(pieChartRef.value)

  const colorMap = {
    '运行中': '#52c41a',
    '待机': '#1a73e8',
    '维修中': '#faad14',
    '故障': '#ff4d4f',
    '停机': '#909399'
  }

  pieChart.setOption({
    tooltip: { trigger: 'item', formatter: '{b}: {c} 台 ({d}%)' },
    legend: { bottom: 0, icon: 'circle', textStyle: { fontSize: 12 } },
    series: [
      {
        type: 'pie',
        radius: ['40%', '65%'],
        center: ['50%', '45%'],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
        label: { show: false },
        emphasis: { label: { show: true, fontSize: 14, fontWeight: 'bold' } },
        data: dashboardData.equipmentStatus.map(item => ({
          ...item,
          itemStyle: { color: colorMap[item.name] }
        }))
      }
    ]
  })
}

// 车间产能对比柱状图
function renderBarChart() {
  if (!barChart) barChart = echarts.init(barChartRef.value)

  const data = dashboardData.workshopComparison

  barChart.setOption({
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: { data: ['实际产能', '目标产能'], bottom: 0 },
    grid: { top: 30, left: 40, right: 20, bottom: 40 },
    xAxis: {
      type: 'category',
      data: data.map(d => d.name),
      axisLine: { lineStyle: { color: '#e0e0e0' } },
      axisLabel: { color: '#666' }
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisLabel: { color: '#666' },
      splitLine: { lineStyle: { color: '#f0f0f0' } }
    },
    series: [
      {
        name: '实际产能',
        type: 'bar',
        data: data.map(d => d.output),
        itemStyle: { color: '#1a73e8', borderRadius: [4, 4, 0, 0] },
        barWidth: '30%'
      },
      {
        name: '目标产能',
        type: 'bar',
        data: data.map(d => d.target),
        itemStyle: { color: '#d9d9d9', borderRadius: [4, 4, 0, 0] },
        barWidth: '30%'
      }
    ]
  })
}

// 监听切换趋势类型
watch(trendType, () => renderTrendChart())

// 窗口大小变化时重绘
function handleResize() {
  trendChart?.resize()
  pieChart?.resize()
  barChart?.resize()
}

onMounted(() => {
  loadData()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  trendChart?.dispose()
  pieChart?.dispose()
  barChart?.dispose()
})
</script>

<style lang="scss" scoped>
.dashboard {
  padding: 20px;
}

.overview-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 20px;

  .overview-card {
    border-radius: 8px;

    .card-inner {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .card-value {
      .value {
        font-size: 28px;
        font-weight: 700;
        color: #303133;
      }
      .unit {
        font-size: 14px;
        color: #909399;
        margin-left: 4px;
      }
    }

    .card-label {
      font-size: 13px;
      color: #909399;
      margin-top: 6px;
    }

    .card-trend {
      display: flex;
      align-items: center;
      gap: 2px;
      font-size: 12px;
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid #f0f0f0;

      &.up { color: #ff4d4f; }
      &.down { color: #52c41a; }

      .trend-label {
        color: #c0c4cc;
        margin-left: 4px;
      }
    }
  }
}

.chart-row {
  margin-bottom: 20px;
}

.chart-card {
  border-radius: 8px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .chart-box {
    height: 280px;
  }
}

.alert-list {
  height: 280px;
  overflow-y: auto;
  padding-right: 8px;

  .alert-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 0;
    border-bottom: 1px solid #f5f5f5;

    .alert-title {
      flex: 1;
      font-size: 13px;
      color: #303133;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .alert-time {
      font-size: 12px;
      color: #c0c4cc;
      white-space: nowrap;
    }
  }
}

@media (max-width: 1200px) {
  .overview-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
