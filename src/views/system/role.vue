<template>
  <div class="page-container">
    <el-card class="app-card" shadow="never">
      <div class="table-header">
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon> 新增角色
        </el-button>
      </div>

      <el-table :data="tableData" v-loading="loading" border stripe>
        <el-table-column prop="id" label="#" width="50" />
        <el-table-column prop="name" label="角色名称" width="120" />
        <el-table-column prop="code" label="角色编码" width="100" />
        <el-table-column prop="desc" label="描述" min-width="200" />
        <el-table-column prop="userCount" label="用户数" width="80" />
        <el-table-column label="操作" width="130">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialog.visible" :title="dialog.title" width="560px" @close="resetForm">
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="80px">
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="formData.name" placeholder="角色名称" />
        </el-form-item>
        <el-form-item label="角色编码" prop="code">
          <el-input v-model="formData.code" placeholder="如 admin、operator" />
        </el-form-item>
        <el-form-item label="描述" prop="desc">
          <el-input v-model="formData.desc" type="textarea" :rows="3" placeholder="角色描述" />
        </el-form-item>
        <el-form-item label="权限分配">
          <el-tree
            ref="treeRef"
            :data="permissionTree"
            :props="{ label: 'label', children: 'children' }"
            show-checkbox
            node-key="id"
            default-expand-all
          />
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
import { getRoleList, addRole, updateRole, deleteRole } from '@/api/system'

const loading = ref(false)
const tableData = ref([])
const formRef = ref()
const treeRef = ref()

const dialog = reactive({ visible: false, title: '新增角色', isEdit: false })
const formData = reactive({ id: null, name: '', code: '', desc: '' })

const formRules = {
  name: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入角色编码', trigger: 'blur' }]
}

// 权限树
const permissionTree = [
  {
    id: 'dashboard',
    label: '数据看板',
    children: [{ id: 'dashboard:view', label: '查看' }]
  },
  {
    id: 'equipment',
    label: '设备管理',
    children: [
      { id: 'equipment:view', label: '查看' },
      { id: 'equipment:add', label: '新增' },
      { id: 'equipment:edit', label: '编辑' },
      { id: 'equipment:delete', label: '删除' }
    ]
  },
  {
    id: 'workorder',
    label: '工单管理',
    children: [
      { id: 'workorder:view', label: '查看' },
      { id: 'workorder:add', label: '新增' },
      { id: 'workorder:edit', label: '编辑' },
      { id: 'workorder:delete', label: '删除' }
    ]
  },
  {
    id: 'quality',
    label: '质量检测',
    children: [{ id: 'quality:view', label: '查看' }]
  },
  {
    id: 'system',
    label: '系统设置',
    children: [
      { id: 'system:role', label: '角色管理' },
      { id: 'system:log', label: '操作日志' }
    ]
  }
]

async function fetchData() {
  loading.value = true
  try {
    const { data } = await getRoleList()
    tableData.value = data
  } finally {
    loading.value = false
  }
}

function handleAdd() {
  Object.assign(formData, { id: null, name: '', code: '', desc: '' })
  dialog.title = '新增角色'
  dialog.isEdit = false
  dialog.visible = true
  treeRef.value?.setCheckedKeys([])
}

function handleEdit(row) {
  Object.assign(formData, row)
  dialog.title = '编辑角色'
  dialog.isEdit = true
  dialog.visible = true
}

async function handleSubmit() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    if (dialog.isEdit) {
      await updateRole(formData)
      ElMessage.success('修改成功')
    } else {
      await addRole(formData)
      ElMessage.success('新增成功')
    }
    dialog.visible = false
    fetchData()
  })
}

async function handleDelete(row) {
  await ElMessageBox.confirm(`确认删除角色「${row.name}」？`, '提示', { type: 'warning' })
  await deleteRole(row.id)
  ElMessage.success('删除成功')
  fetchData()
}

function resetForm() { formRef.value?.resetFields() }

onMounted(() => fetchData())
</script>

<style lang="scss" scoped>
.table-header { margin-bottom: 16px; }
</style>
