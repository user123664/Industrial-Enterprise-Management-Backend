<template>
  <div class="tags-view">
    <el-scrollbar>
      <div class="tags-list">
        <div
          v-for="tag in visitedViews"
          :key="tag.path"
          class="tag-item"
          :class="{ active: isActive(tag) }"
          @click="clickTag(tag)"
          @contextmenu.prevent="openContextMenu(tag, $event)"
        >
          {{ tag.title }}
          <el-icon
            v-if="!tag.affix"
            class="close-btn"
            @click.stop="closeTag(tag)"
          >
            <Close />
          </el-icon>
        </div>
      </div>
    </el-scrollbar>

    <!-- 右键菜单 -->
    <ul
      v-show="contextMenu.visible"
      class="context-menu"
      :style="{ top: contextMenu.top + 'px', left: contextMenu.left + 'px' }"
    >
      <li @click="refreshCurrent">刷新</li>
      <li v-if="!contextMenu.tag?.affix" @click="closeCurrent">关闭</li>
      <li @click="closeOthers">关闭其他</li>
      <li @click="closeAll">关闭全部</li>
    </ul>
  </div>
</template>

<script setup>
import { reactive, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()

const visitedViews = computed(() => appStore.visitedViews)

const contextMenu = reactive({
  visible: false,
  top: 0,
  left: 0,
  tag: null
})

// 是否当前激活
function isActive(tag) {
  return tag.path === route.path
}

// 点击标签
function clickTag(tag) {
  router.push(tag.path)
}

// 关闭标签
function closeTag(tag) {
  appStore.removeVisitedView(tag)
  // 如果关闭的是当前页，跳转到最后一个标签
  if (isActive(tag)) {
    const views = appStore.visitedViews
    const last = views[views.length - 1]
    if (last) {
      router.push(last.path)
    } else {
      router.push('/dashboard')
    }
  }
}

// 右键菜单
function openContextMenu(tag, e) {
  contextMenu.visible = true
  contextMenu.top = e.clientY
  contextMenu.left = e.clientX
  contextMenu.tag = tag
}

function closeContextMenu() {
  contextMenu.visible = false
}

function refreshCurrent() {
  closeContextMenu()
  router.replace({ path: '/redirect' + route.fullPath })
}

function closeCurrent() {
  if (contextMenu.tag && !contextMenu.tag.affix) {
    closeTag(contextMenu.tag)
  }
  closeContextMenu()
}

function closeOthers() {
  appStore.removeOtherViews(contextMenu.tag || { path: route.path })
  closeContextMenu()
}

function closeAll() {
  appStore.removeAllViews()
  router.push('/dashboard')
  closeContextMenu()
}

// 监听路由变化，添加标签
watch(
  () => route.path,
  () => {
    if (route.name && route.meta?.title) {
      appStore.addVisitedView(route)
    }
  },
  { immediate: true }
)

onMounted(() => {
  document.addEventListener('click', closeContextMenu)
})

onUnmounted(() => {
  document.removeEventListener('click', closeContextMenu)
})
</script>

<style lang="scss" scoped>
.tags-view {
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
  height: 34px;
  display: flex;
  align-items: center;
  box-shadow: 0 1px 3px rgba(0, 21, 41, 0.05);
  flex-shrink: 0;

  .tags-list {
    display: flex;
    gap: 6px;
    padding: 0 12px;
    white-space: nowrap;
  }

  .tag-item {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 3px 10px;
    font-size: 12px;
    border: 1px solid #e6e6e6;
    border-radius: 3px;
    cursor: pointer;
    color: #495060;
    background: #fff;
    white-space: nowrap;

    &:hover {
      color: #1a73e8;
    }

    &.active {
      background: #1a73e8;
      color: #fff;
      border-color: #1a73e8;
    }

    .close-btn {
      font-size: 12px;
      border-radius: 50%;

      &:hover {
        background: rgba(255, 255, 255, 0.3);
      }
    }
  }

  .context-menu {
    position: fixed;
    z-index: 3000;
    background: #fff;
    border: 1px solid #e6e6e6;
    border-radius: 4px;
    box-shadow: 2px 2px 12px rgba(0, 0, 0, 0.12);
    padding: 4px 0;
    list-style: none;
    margin: 0;

    li {
      padding: 6px 16px;
      font-size: 13px;
      cursor: pointer;

      &:hover {
        background: #f2f6fc;
        color: #1a73e8;
      }
    }
  }
}
</style>
