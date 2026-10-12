<template>
  <el-container class="layout-container">
    <!-- 侧边栏 -->
    <el-aside :width="sidebarWidth" class="layout-sidebar">
      <SidebarMenu />
    </el-aside>

    <!-- 右侧区域 -->
    <el-container class="layout-main">
      <!-- 顶部导航 -->
      <el-header class="layout-header">
        <Navbar />
      </el-header>

      <!-- 标签页导航 -->
      <TagsView />

      <!-- 主内容区 -->
      <el-main class="layout-content">
        <router-view v-slot="{ Component }">
          <transition name="fade-slide" mode="out-in">
            <keep-alive :include="cachedViews">
              <component :is="Component" :key="route.fullPath" />
            </keep-alive>
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import SidebarMenu from './components/SidebarMenu.vue'
import Navbar from './components/Navbar.vue'
import TagsView from './components/TagsView.vue'
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()
const route = useRoute()

const sidebarWidth = computed(() =>
  appStore.sidebarCollapsed ? '64px' : '210px'
)

// 缓存的视图
const cachedViews = computed(() =>
  appStore.visitedViews.map(v => v.name).filter(Boolean)
)
</script>

<style lang="scss" scoped>
@use '@/assets/styles/variables.scss' as *;

.layout-container {
  height: 100vh;
  overflow: hidden;
}

.layout-sidebar {
  background: #001529;
  transition: width 0.28s ease;
  overflow: hidden;
  flex-shrink: 0;
}

.layout-main {
  flex: 1;
  overflow: hidden;
}

.layout-header {
  height: $header-height;
  padding: 0;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  z-index: 10;
}

.layout-content {
  background: $bg-color;
  padding: 0;
  overflow-y: auto;
}

// 路由切换动画
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.25s ease;
}
.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(20px);
}
.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
</style>
