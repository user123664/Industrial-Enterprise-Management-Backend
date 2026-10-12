<template>
  <div class="page-container">
    <el-card class="app-card" shadow="never">
      <div class="filter-bar">
        <el-input
          v-model="filters.keyword"
          placeholder="产品名称/工单编号"
          clearable
          style="width: 200px"
          @keyup.enter="handleSearch"
        />
        <el-select v-model="filters.status" placeholder="工单状态" clearable style="width: 120px">
          <el-option v-for="s in statusOptions" :key="s" :label="s" :value="s" />
        </el-select>
        <el-select v-model="filters.priority" placeholder="优先级" clearable style="width: 100px">
          <el-option label="高" value="高" />
          <el-option label="中" value="中" />
          <el-option label="低" value="低" />
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
      <!-- 统计条 -->
      <el-row :gutter="16" class="status-summary">
        <el-col v-for="item in statusSummary" :key="item.label" :span="6">
          <div class="summary-card" :style="{ background: item.bg }">
            <div class="summary-value">{{ item.count }}</div>
            <div class="summary-label">{{ item.label }}</div>
          </div>
        </el-col>
      </el-row>

      <div class="table-header">
        <el-button v-role="['admin', 'operator']" type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon> 新建工单
        </el-button>
      </div>

      <el-table :data="tableData" v-loading="loading" border stripe>
        <el-table-column prop="code" label="工单编号" width="140" />
        <el-table-column prop="productName" label="产品" width="140" />
        <el-table-column label="数量/完成" width="100">
          <template #default="{ row }">
            <span>{{ row.completedQty }} / {{ row.quantity }}</span>
          </template>
        </el-table-column>
        <el-table-column label="完成进度" width="160">
          <template #default="{ row }">
            <el-progress
              :percentage="Math.round((row.completedQty / row.quantity) * 100)"
              :stroke-width="8"
              :color="getProgressColor(row.completedQty / row.quantity)"
            />
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTag(row.status)" effect="light">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="优先级" width="80">
          <template #default="{ row }">
            <el-tag :type="getPriorityTag(row.priority)" effect="dark" size="small">
              {{ row.priority }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="workshop" label="车间" width="80" />
        <el-table-column prop="assignee" label="负责人" width="80" />
        <el-table-column prop="createdAt" label="创建时间" width="160" />
        <el-table-column prop="deadline" label="截止日期" width="110" />
        <el-table-column label="操作" width="130" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button v-role="['admin']" type="danger" link size="small" @click="handleDelete(row)">删除</el-button>
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

    <!-- 新建/编辑弹窗 -->
    <el-dialog v-model="dialog.visible" :title="dialog.title" width="560px" @close="resetForm">
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="80px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="产品" prop="productName">
              <el-input v-model="formData.productName" placeholder="产品名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="数量" prop="quantity">
              <el-input-number v-model="formData.quantity" :min="1" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-select v-model="formData.status" style="width: 100%">
                <el-option v-for="s in statusOptions" :key="s" :label="s" :value="s" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="优先级" prop="priority">
              <el-select v-model="formData.priority" style="width: 100%">
                <el-option label="高" value="高" />
                <el-option label="中" value="中" />
                <el-option label="低" value="低" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="车间" prop="workshop">
              <el-select v-model="formData.workshop" style="width: 100%">
                <el-option v-for="w in ['车间1', '车间2', '车间3', '车间4']" :key="w" :label="w" :value="w" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="负责人" prop="assignee">
              <el-input v-model="formData.assignee" placeholder="负责人姓名" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="截止日期" prop="deadline">
          <el-date-picker v-model="formData.deadline" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialog.visible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getWorkorderList, addWorkorder, updateWorkorder, deleteWorkorder } from '@/api/workorder'

const loading = ref(false)
const tableData = ref([])
const formRef = ref()

const statusOptions = ['待分配', '进行中', '已完成', '已取消', '质检中']

const filters = reactive({ keyword: '', status: '', priority: '' })
const pagination = reactive({ page: 1, pageSize: 10, total: 0 })
const dialog = reactive({ visible: false, title: '新建工单', isEdit: false })

const formData = reactive({
  id: null, productName: '', quantity: 100, status: '待分配', priority: '中', workshop: '', assignee: '', deadline: ''
})

const formRules = {
  productName: [{ required: true, message: '请输入产品名称', trigger: 'blur' }],
  quantity: [{ required: true, message: '请输入数量', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
  workshop: [{ required: true, message: '请选择车间', trigger: 'change' }],
  assignee: [{ required: true, message: '请输入负责人', trigger: 'blur' }]
}

// 统计条
const statusSummary = computed(() => {
  const counts = { '待分配': 0, '进行中': 0, '已完成': 0, '已取消': 0 }
  tableData.value.forEach(item => {
    if (counts[item.status] !== undefined) counts[item.status]++
  })
  return [
    { label: '待分配', count: counts['待分配'], bg: 'linear-gradient(135deg, #e3f2fd, #bbdefb)' },
    { label: '进行中', count: counts['进行中'], bg: 'linear-gradient(135deg, #fff3e0, #ffe0b2)' },
    { label: '已完成', count: counts['已完成'], bg: 'linear-gradient(135deg, #e8f5e9, #c8e6c9)' },
    { label: '已取消', count: counts['已取消'], bg: 'linear-gradient(135deg, #fafafa, #f5f5f5)' }
  ]
})

function getStatusTag(status) {
  const map = { '待分配': 'info', '进行中': '', '已完成': 'success', '已取消': 'danger', '质检中': 'warning' }
  return map[status] || 'info'
}

function getPriorityTag(priority) {
  const map = { '高': 'danger', '中': 'warning', '低': 'info' }
  return map[priority] || 'info'
}

function getProgressColor(ratio) {
  if (ratio >= 1) return '#52c41a'
  if (ratio >= 0.5) return '#1a73e8'
  return '#faad14'
}

async function fetchData() {
  loading.value = true
  try {
    const { data } = await getWorkorderList({
      page: pagination.page,
      pageSize: pagination.pageSize,
      keyword: filters.keyword,
      status: filters.status,
      priority: filters.priority
    })
    tableData.value = data.list
    pagination.total = data.total
  } finally {
    loading.value = false
  }
}

function handleSearch() { pagination.page = 1; fetchData() }
function handleReset() { Object.assign(filters, { keyword: '', status: '', priority: '' }); handleSearch() }

function handleAdd() {
  Object.assign(formData, { id: null, productName: '', quantity: 100, status: '待分配', priority: '中', workshop: '', assignee: '', deadline: '' })
  dialog.title = '新建工单'
  dialog.isEdit = false
  dialog.visible = true
}

function handleEdit(row) {
  Object.assign(formData, row)
  dialog.title = '编辑工单'
  dialog.isEdit = true
  dialog.visible = true
}

async function handleSubmit() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    if (dialog.isEdit) {
      await updateWorkorder(formData)
      ElMessage.success('修改成功')
    } else {
      await addWorkorder(formData)
      ElMessage.success('新建成功')
    }
    dialog.visible = false
    fetchData()
  })
}

async function handleDelete(row) {
  await ElMessageBox.confirm(`确认删除工单「${row.code}」？`, '提示', { type: 'warning' })
  await deleteWorkorder(row.id)
  ElMessage.success('删除成功')
  fetchData()
}

function resetForm() { formRef.value?.resetFields() }

onMounted(() => fetchData())
</script>

<style lang="scss" scoped>
.status-summary {
  margin-bottom: 16px;

  .summary-card {
    border-radius: 8px;
    padding: 14px 16px;
    text-align: center;

    .summary-value {
      font-size: 24px;
      font-weight: 700;
      color: #303133;
    }
    .summary-label {
      font-size: 13px;
      color: #606266;
      margin-top: 4px;
    }
  }
}

.table-header { margin-bottom: 16px; }
.table-footer { display: flex; justify-content: flex-end; margin-top: 16px; }
</style>
