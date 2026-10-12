<template>
  <div class="login-container">
    <!-- 左侧展示区 -->
    <div class="login-banner">
      <div class="banner-content">
        <div class="banner-logo">
          <el-icon :size="40" color="#fff"><Factory /></el-icon>
          <h1>智云工控</h1>
        </div>
        <p class="banner-subtitle">工业企业运营管理后台</p>
        <ul class="banner-features">
          <li><el-icon><CircleCheckFilled /></el-icon> 设备全生命周期管理</li>
          <li><el-icon><CircleCheckFilled /></el-icon> 生产工单全流程跟踪</li>
          <li><el-icon><CircleCheckFilled /></el-icon> 质量检测数据分析</li>
          <li><el-icon><CircleCheckFilled /></el-icon> RBAC 权限精细控制</li>
        </ul>
      </div>
    </div>

    <!-- 右侧登录表单 -->
    <div class="login-form-wrapper">
      <div class="login-form-box">
        <div class="form-header">
          <h2>欢迎登录</h2>
          <p>请输入您的账号密码</p>
        </div>

        <el-form
          ref="loginFormRef"
          :model="loginForm"
          :rules="loginRules"
          class="login-form"
          size="large"
        >
          <el-form-item prop="username">
            <el-input
              v-model="loginForm.username"
              placeholder="请输入用户名"
              :prefix-icon="User"
              clearable
              @keyup.enter="handleLogin"
            />
          </el-form-item>

          <el-form-item prop="password">
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码（统一为 123456）"
              :prefix-icon="Lock"
              show-password
              @keyup.enter="handleLogin"
            />
          </el-form-item>

          <el-form-item>
            <div class="form-actions">
              <el-checkbox v-model="loginForm.remember">记住我</el-checkbox>
              <el-link type="primary" :underline="false">忘记密码？</el-link>
            </div>
          </el-form-item>

          <el-button
            type="primary"
            class="login-btn"
            :loading="loading"
            @click="handleLogin"
          >
            登 录
          </el-button>
        </el-form>

        <!-- 测试账号 -->
        <div class="demo-accounts">
          <p class="demo-title">测试账号（点击快速填充）</p>
          <div class="demo-list">
            <div
              v-for="account in demoAccounts"
              :key="account.username"
              class="demo-item"
              @click="fillAccount(account)"
            >
              <el-tag :type="account.tagType" size="small" effect="dark">
                {{ account.label }}
              </el-tag>
              <span class="demo-user">{{ account.username }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { User, Lock } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const loginFormRef = ref()
const loading = ref(false)

const loginForm = reactive({
  username: 'admin',
  password: '123456',
  remember: true
})

const loginRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少 6 位', trigger: 'blur' }
  ]
}

const demoAccounts = [
  { username: 'admin', password: '123456', label: '管理员', tagType: 'danger' },
  { username: 'operator', password: '123456', label: '操作员', tagType: 'warning' },
  { username: 'viewer', password: '123456', label: '观察员', tagType: 'info' }
]

function fillAccount(account) {
  loginForm.username = account.username
  loginForm.password = account.password
}

async function handleLogin() {
  if (!loginFormRef.value) return
  await loginFormRef.value.validate(async (valid) => {
    if (!valid) return
    loading.value = true
    try {
      await userStore.login({
        username: loginForm.username,
        password: loginForm.password
      })
      ElMessage.success('登录成功')
      const redirect = route.query.redirect || '/'
      router.push(redirect)
    } catch (err) {
      ElMessage.error(err.message || '登录失败')
    } finally {
      loading.value = false
    }
  })
}
</script>

<style lang="scss" scoped>
.login-container {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

.login-banner {
  flex: 1;
  background: linear-gradient(135deg, #1a237e 0%, #283593 50%, #3949ab 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -20%;
    width: 600px;
    height: 600px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.05);
  }

  &::after {
    content: '';
    position: absolute;
    bottom: -30%;
    left: -10%;
    width: 400px;
    height: 400px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.05);
  }

  .banner-content {
    position: relative;
    z-index: 1;
    color: #fff;
    max-width: 400px;
    padding: 0 40px;

    .banner-logo {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 8px;

      h1 {
        font-size: 28px;
        font-weight: 600;
        letter-spacing: 2px;
      }
    }

    .banner-subtitle {
      font-size: 16px;
      color: rgba(255, 255, 255, 0.8);
      margin-bottom: 40px;
    }

    .banner-features {
      li {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        color: rgba(255, 255, 255, 0.9);
        margin-bottom: 14px;

        .el-icon {
          color: #4fc3f7;
        }
      }
    }
  }
}

.login-form-wrapper {
  width: 460px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;

  .login-form-box {
    width: 360px;
    padding: 40px;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  }
}

.form-header {
  text-align: center;
  margin-bottom: 32px;

  h2 {
    font-size: 24px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 8px;
  }

  p {
    font-size: 14px;
    color: #909399;
  }
}

.form-actions {
  display: flex;
  justify-content: space-between;
  width: 100%;
}

.login-btn {
  width: 100%;
  height: 42px;
  font-size: 16px;
  letter-spacing: 4px;
}

.demo-accounts {
  margin-top: 28px;
  padding-top: 20px;
  border-top: 1px dashed #e4e7ed;

  .demo-title {
    font-size: 12px;
    color: #909399;
    margin-bottom: 10px;
  }

  .demo-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .demo-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 12px;
    border: 1px solid #e4e7ed;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      border-color: #1a73e8;
      background: #f2f6fc;
    }

    .demo-user {
      font-size: 13px;
      color: #606266;
    }
  }
}

// 响应式
@media (max-width: 768px) {
  .login-banner {
    display: none;
  }
  .login-form-wrapper {
    width: 100%;
  }
}
</style>
