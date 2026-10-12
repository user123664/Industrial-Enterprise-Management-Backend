<template>
  <div class="page-container">
    <el-card class="app-card" shadow="never">
      <div class="filter-bar">
        <el-input
          v-model="filters.keyword"
          placeholder="用户/操作"
          clearable
          style="width: 200px"
          @keyup.enter="handleSearch"
        />
        <el-select v-model="filters.module" placeholder="操作模块" clearable style="width: 140px">
          <el-option v-for="m in modules" :key="m" :label="m" :value="m" />
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
        <el-table-column prop="id" label="#" width="50" />
        <el-table-column prop="user" label="操作用户" width="100" />
        <el-table-column prop="action" label="操作内容" min-width="120" />
        <el-table-column prop="module" label="模块" width="100" />
        <el-table-column prop="ip" label="IP 地址" width="120" />
        <el-table-column prop="time" label="操作时间" width="180" />
        <el-table-column label="结果" width="70">
          <template #default="{ row }">
            <el-tag :type="row.result === '成功' ? 'success' : 'danger'" effect="light">
              {{ row.result }}
            </el-tag>
          </template>
        </el-table-column>
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
import { getLogList } from '@/api/system'

const loading = ref(false)
const tableData = ref([])
const modules = ['设备管理', '工单管理', '质量检测', '系统设置']

const filters = reactive({ keyword: '', module: '' })
const pagination = reactive({ page: 1, pageSize: 10, total: 0 })

async function fetchData() {
  loading.value = true
  try {
    const { data } = await getLogList({
      page: pagination.page,
      pageSize: pagination.pageSize,
      keyword: filters.keyword
    })
    let list = data.list
    if (filters.module) {
      list = list.filter(i => i.module === filters.module)
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
function handleReset() { Object.assign(filters, { keyword: '', module: '' }); handleSearch() }

onMounted(() => fetchData())
</script>

<style lang="scss" scoped>
.table-footer { display: flex; justify-content: flex-end; margin-top: 16px; }
</style>
