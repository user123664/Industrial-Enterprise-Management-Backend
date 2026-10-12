<template>
  <div class="page-container">
    <el-card class="app-card" shadow="never">
      <div class="filter-bar">
        <el-select v-model="filters.status" placeholder="维护状态" clearable style="width: 140px">
          <el-option v-for="s in statusOptions" :key="s" :label="s" :value="s" />
        </el-select>
        <el-button type="primary" @click="handleSearch">
          <el-icon><Search /></el-icon> 查询
        </el-button>
        <el-button @click="handleReset">
          <el-icon><Refresh /></el-icon> 重置
        </el-button>
      </div>
    </el-card>

    <el-card class="app-card" shadow="never">
      <el-table :data="tableData" v-loading="loading" border stripe>
        <el-table-column prop="equipmentCode" label="设备编号" width="100" />
        <el-table-column prop="equipmentName" label="设备名称" width="160" />
        <el-table-column label="维护类型" width="110">
          <template #default="{ row }">
            <el-tag :type="getTypeTag(row.type)" effect="plain">{{ row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="maintainer" label="维护人" width="100" />
        <el-table-column prop="startDate" label="开始日期" width="120" />
        <el-table-column prop="endDate" label="结束日期" width="120" />
        <el-table-column label="费用" width="100">
          <template #default="{ row }">
            ¥{{ row.cost }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTag(row.status)" effect="light">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
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
import { ref, reactive, onMounted } from 'vue'
import { getMaintenanceList } from '@/api/equipment'

const loading = ref(false)
const tableData = ref([])
const statusOptions = ['已完成', '进行中', '待开始']

const filters = reactive({ status: '' })
const pagination = reactive({ page: 1, pageSize: 10, total: 0 })

function getTypeTag(type) {
  const map = { '日常保养': '', '定期检修': 'success', '故障维修': 'danger', '大修': 'warning' }
  return map[type] || ''
}

function getStatusTag(status) {
  const map = { '已完成': 'success', '进行中': 'warning', '待开始': 'info' }
  return map[status] || 'info'
}

async function fetchData() {
  loading.value = true
  try {
    const { data } = await getMaintenanceList({
      page: pagination.page,
      pageSize: pagination.pageSize
    })
    let list = data.list
    if (filters.status) {
      list = list.filter(i => i.status === filters.status)
      pagination.total = list.length
    } else {
      pagination.total = data.total
    }
    tableData.value = list
  } finally {
    loading.value = false
  }
}

function handleSearch() { pagination.page = 1; fetchData() }
function handleReset() { filters.status = ''; handleSearch() }

onMounted(() => fetchData())
</script>

<style lang="scss" scoped>
.table-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
