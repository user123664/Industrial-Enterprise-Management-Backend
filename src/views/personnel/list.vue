<template>
  <div class="page-container">
    <el-card class="app-card" shadow="never">
      <div class="filter-bar">
        <el-input
          v-model="filters.keyword"
          placeholder="员工姓名"
          clearable
          style="width: 180px"
          @keyup.enter="handleSearch"
        />
        <el-select v-model="filters.department" placeholder="部门" clearable style="width: 140px">
          <el-option v-for="d in departments" :key="d" :label="d" :value="d" />
        </el-select>
        <el-button type="primary" @click="handleSearch">
          <el-icon><Search /></el-icon> 查询
        </el-button>
        <el-button @click="handleReset">
          <el-icon><Refresh /></el-icon> 重置
        </el-button>
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon> 新增员工
        </el-button>
      </div>
    </el-card>

    <el-card class="app-card" shadow="never">
      <el-table :data="tableData" v-loading="loading" border stripe>
        <el-table-column type="index" label="#" width="50" />
        <el-table-column prop="name" label="姓名" width="80" />
        <el-table-column label="性别" width="60">
          <template #default="{ row }">
            <el-tag :type="row.gender === '男' ? '' : 'danger'" size="small">{{ row.gender }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="age" label="年龄" width="60" />
        <el-table-column prop="phone" label="手机号" width="140" />
        <el-table-column prop="department" label="部门" width="100" />
        <el-table-column prop="position" label="岗位" width="80" />
        <el-table-column prop="entryDate" label="入职日期" width="100" />
        <el-table-column label="状态" width="70">
          <template #default="{ row }">
            <el-tag :type="row.status === '在职' ? 'success' : 'info'" effect="light">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="130" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button>
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

    <el-dialog v-model="dialog.visible" :title="dialog.title" width="520px" @close="resetForm">
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="70px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="姓名" prop="name">
              <el-input v-model="formData.name" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="性别" prop="gender">
              <el-select v-model="formData.gender" style="width: 100%">
                <el-option label="男" value="男" />
                <el-option label="女" value="女" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="手机号" prop="phone">
              <el-input v-model="formData.phone" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="部门" prop="department">
              <el-select v-model="formData.department" style="width: 100%">
                <el-option v-for="d in departments" :key="d" :label="d" :value="d" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="岗位" prop="position">
              <el-select v-model="formData.position" style="width: 100%">
                <el-option v-for="p in positions" :key="p" :label="p" :value="p" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="入职日期" prop="entryDate">
              <el-date-picker v-model="formData.entryDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
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
import { getPersonnelList, addPersonnel, updatePersonnel, deletePersonnel } from '@/api/system'

const loading = ref(false)
const tableData = ref([])
const formRef = ref()

const departments = ['生产一车间', '生产二车间', '质检部', '设备部', '信息中心', '综合办']
const positions = ['车间主任', '操作工', '质检员', '维修工', '工程师', '管理员']

const filters = reactive({ keyword: '', department: '' })
const pagination = reactive({ page: 1, pageSize: 10, total: 0 })
const dialog = reactive({ visible: false, title: '新增员工', isEdit: false })
const formData = reactive({ id: null, name: '', gender: '男', phone: '', department: '', position: '', entryDate: '' })

const formRules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入手机号', trigger: 'blur' }],
  department: [{ required: true, message: '请选择部门', trigger: 'change' }],
  position: [{ required: true, message: '请选择岗位', trigger: 'change' }]
}

async function fetchData() {
  loading.value = true
  try {
    const { data } = await getPersonnelList({
      page: pagination.page,
      pageSize: pagination.pageSize,
      keyword: filters.keyword,
      department: filters.department
    })
    tableData.value = data.list
    pagination.total = data.total
  } finally {
    loading.value = false
  }
}

function handleSearch() { pagination.page = 1; fetchData() }
function handleReset() { Object.assign(filters, { keyword: '', department: '' }); handleSearch() }

function handleAdd() {
  Object.assign(formData, { id: null, name: '', gender: '男', phone: '', department: '', position: '', entryDate: '' })
  dialog.title = '新增员工'
  dialog.isEdit = false
  dialog.visible = true
}

function handleEdit(row) {
  Object.assign(formData, row)
  dialog.title = '编辑员工'
  dialog.isEdit = true
  dialog.visible = true
}

async function handleSubmit() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    if (dialog.isEdit) {
      await updatePersonnel(formData)
      ElMessage.success('修改成功')
    } else {
      await addPersonnel(formData)
      ElMessage.success('新增成功')
    }
    dialog.visible = false
    fetchData()
  })
}

async function handleDelete(row) {
  await ElMessageBox.confirm(`确认删除员工「${row.name}」？`, '提示', { type: 'warning' })
  await deletePersonnel(row.id)
  ElMessage.success('删除成功')
  fetchData()
}

function resetForm() { formRef.value?.resetFields() }

onMounted(() => fetchData())
</script>

<style lang="scss" scoped>
.table-footer { display: flex; justify-content: flex-end; margin-top: 16px; }
</style>
