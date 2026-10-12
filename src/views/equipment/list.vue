<template>
  <div class="page-container">
    <!-- 搜索区域 -->
    <el-card class="app-card" shadow="never">
      <div class="filter-bar">
        <el-input
          v-model="filters.keyword"
          placeholder="设备名称/编号"
          clearable
          style="width: 200px"
          @keyup.enter="handleSearch"
        />
        <el-select v-model="filters.status" placeholder="设备状态" clearable style="width: 140px">
          <el-option v-for="s in statusOptions" :key="s" :label="s" :value="s" />
        </el-select>
        <el-select v-model="filters.type" placeholder="设备类型" clearable style="width: 140px">
          <el-option v-for="t in typeOptions" :key="t" :label="t" :value="t" />
        </el-select>
        <el-button type="primary" @click="handleSearch">
          <el-icon><Search /></el-icon> 查询
        </el-button>
        <el-button @click="handleReset">
          <el-icon><Refresh /></el-icon> 重置
        </el-button>
      </div>
    </el-card>

    <!-- 表格区域 -->
    <el-card class="app-card" shadow="never">
      <div class="table-header">
        <el-button v-role="['admin']" type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon> 新增设备
        </el-button>
        <el-button v-role="['admin']" type="danger" :disabled="!selection.length" @click="handleBatchDelete">
          <el-icon><Delete /></el-icon> 批量删除
        </el-button>
        <el-button @click="handleExport">
          <el-icon><Download /></el-icon> 导出
        </el-button>
      </div>

      <el-table
        :data="tableData"
        v-loading="loading"
        border
        stripe
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="50" />
        <el-table-column prop="code" label="设备编号" width="100" />
        <el-table-column prop="name" label="设备名称" width="160" />
        <el-table-column prop="type" label="类型" width="110" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTag(row.status)" effect="light">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="workshop" label="所在车间" width="90" />
        <el-table-column prop="location" label="位置" width="120" />
        <el-table-column prop="utilization" label="利用率" width="100">
          <template #default="{ row }">
            <el-progress :percentage="row.utilization" :stroke-width="6" />
          </template>
        </el-table-column>
        <el-table-column prop="lastMaintenance" label="上次维护" width="110" />
        <el-table-column prop="nextMaintenance" label="下次维护" width="110" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button v-role="['admin']" type="danger" link size="small" @click="handleDelete(row)">
              删除
            </el-button>
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

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      v-model="dialog.visible"
      :title="dialog.title"
      width="520px"
      @close="resetForm"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="80px"
      >
        <el-form-item label="编号" prop="code">
          <el-input v-model="formData.code" placeholder="如 EQ-0001" />
        </el-form-item>
        <el-form-item label="名称" prop="name">
          <el-input v-model="formData.name" placeholder="设备名称" />
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-select v-model="formData.type" placeholder="选择类型" style="width: 100%">
            <el-option v-for="t in typeOptions" :key="t" :label="t" :value="t" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="formData.status" placeholder="选择状态" style="width: 100%">
            <el-option v-for="s in statusOptions" :key="s" :label="s" :value="s" />
          </el-select>
        </el-form-item>
        <el-form-item label="车间" prop="workshop">
          <el-select v-model="formData.workshop" placeholder="选择车间" style="width: 100%">
            <el-option v-for="w in ['车间1', '车间2', '车间3', '车间4']" :key="w" :label="w" :value="w" />
          </el-select>
        </el-form-item>
        <el-form-item label="位置" prop="location">
          <el-input v-model="formData.location" placeholder="如 A区-1号位" />
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
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getEquipmentList, addEquipment, updateEquipment, deleteEquipment } from '@/api/equipment'

const loading = ref(false)
const tableData = ref([])
const selection = ref([])
const formRef = ref()

const statusOptions = ['运行中', '待机', '维修中', '故障', '停机']
const typeOptions = ['数控车床', '注塑机', '冲压机', '焊接机器人', 'AGV小车', '检测仪']

const filters = reactive({
  keyword: '',
  status: '',
  type: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const dialog = reactive({
  visible: false,
  title: '新增设备',
  isEdit: false
})

const formData = reactive({
  id: null,
  code: '',
  name: '',
  type: '',
  status: '',
  workshop: '',
  location: ''
})

const formRules = {
  code: [{ required: true, message: '请输入设备编号', trigger: 'blur' }],
  name: [{ required: true, message: '请输入设备名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择类型', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
  workshop: [{ required: true, message: '请选择车间', trigger: 'change' }]
}

// 状态标签颜色
function getStatusTag(status) {
  const map = {
    '运行中': 'success',
    '待机': '',
    '维修中': 'warning',
    '故障': 'danger',
    '停机': 'info'
  }
  return map[status] || 'info'
}

// 加载数据
async function fetchData() {
  loading.value = true
  try {
    const { data } = await getEquipmentList({
      page: pagination.page,
      pageSize: pagination.pageSize,
      keyword: filters.keyword,
      status: filters.status,
      type: filters.type
    })
    tableData.value = data.list
    pagination.total = data.total
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  pagination.page = 1
  fetchData()
}

function handleReset() {
  filters.keyword = ''
  filters.status = ''
  filters.type = ''
  handleSearch()
}

function handleSelectionChange(val) {
  selection.value = val
}

function handleAdd() {
  Object.assign(formData, {
    id: null, code: '', name: '', type: '', status: '', workshop: '', location: ''
  })
  dialog.title = '新增设备'
  dialog.isEdit = false
  dialog.visible = true
}

function handleEdit(row) {
  Object.assign(formData, row)
  dialog.title = '编辑设备'
  dialog.isEdit = true
  dialog.visible = true
}

async function handleSubmit() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    if (dialog.isEdit) {
      await updateEquipment(formData)
      ElMessage.success('修改成功')
    } else {
      await addEquipment(formData)
      ElMessage.success('新增成功')
    }
    dialog.visible = false
    fetchData()
  })
}

async function handleDelete(row) {
  await ElMessageBox.confirm(`确认删除设备「${row.name}」？`, '提示', { type: 'warning' })
  await deleteEquipment(row.id)
  ElMessage.success('删除成功')
  fetchData()
}

async function handleBatchDelete() {
  await ElMessageBox.confirm(`确认删除选中的 ${selection.value.length} 条设备？`, '提示', { type: 'warning' })
  for (const item of selection.value) {
    await deleteEquipment(item.id)
  }
  ElMessage.success('批量删除成功')
  fetchData()
}

function handleExport() {
  ElMessage.info('导出功能演示中...')
}

function resetForm() {
  formRef.value?.resetFields()
}

onMounted(() => fetchData())
</script>

<style lang="scss" scoped>
.table-header {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.table-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
