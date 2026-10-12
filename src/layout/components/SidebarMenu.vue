<template>
  <div class="sidebar-wrapper">
    <!-- Logo 区域 -->
    <div class="sidebar-logo" :class="{ collapsed: collapsed }">
      <el-icon :size="24" color="#1a73e8"><Factory /></el-icon>
      <span v-show="!collapsed" class="logo-text">智云工控</span>
    </div>

    <!-- 菜单 -->
    <el-scrollbar class="sidebar-scroll">
      <el-menu
        :default-active="activeMenu"
        :collapse="collapsed"
        :collapse-transition="false"
        background-color="#001529"
        text-color="#bfcbd9"
        active-text-color="#fff"
        unique-opened
        router
      >
        <SidebarItem
          v-for="route in menuRoutes"
          :key="route.path"
          :item="route"
          :base-path="route.path"
        />
      </el-menu>
    </el-scrollbar>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { usePermissionStore } from '@/stores/permission'
import SidebarItem from './SidebarItem.vue'

const appStore = useAppStore()
const route = useRoute()
const permissionStore = usePermissionStore()

const collapsed = computed(() => appStore.sidebarCollapsed)

// 从权限 store 获取路由
const menuRoutes = computed(() => permissionStore.sidebarRoutes)

// 当前激活菜单
const activeMenu = computed(() => {
  const { meta, path } = route
  if (meta?.activeMenu) return meta.activeMenu
  return path
})
</script>

<style lang="scss" scoped>
.sidebar-wrapper {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.sidebar-logo {
  height: 56px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 16px;
  background: #001220;
  flex-shrink: 0;

  .logo-text {
    font-size: 17px;
    font-weight: 600;
    color: #fff;
    white-space: nowrap;
    letter-spacing: 1px;
  }

  &.collapsed {
    justify-content: center;
    padding: 0;
  }
}

.sidebar-scroll {
  flex: 1;
  overflow: hidden;

  :deep(.el-menu) {
    border-right: none;
  }
}
</style>
