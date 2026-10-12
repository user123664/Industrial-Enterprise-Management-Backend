<template>
  <!-- 有子路由：渲染子菜单 -->
  <el-sub-menu
    v-if="hasChildren"
    :index="resolvePath(item.path)"
  >
    <template #title>
      <el-icon v-if="item.meta?.icon"><component :is="item.meta.icon" /></el-icon>
      <span>{{ item.meta?.title }}</span>
    </template>
    <SidebarItem
      v-for="child in visibleChildren"
      :key="child.path"
      :item="child"
      :base-path="resolvePath(child.path)"
    />
  </el-sub-menu>

  <!-- 无子路由：渲染菜单项 -->
  <el-menu-item v-else :index="resolvePath(item.path)">
    <el-icon v-if="item.meta?.icon"><component :is="item.meta.icon" /></el-icon>
    <template #title>{{ item.meta?.title }}</template>
  </el-menu-item>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  item: {
    type: Object,
    required: true
  },
  basePath: {
    type: String,
    default: ''
  }
})

// 是否有可见的子路由
const visibleChildren = computed(() => {
  if (!props.item.children) return []
  return props.item.children.filter(c => !c.meta?.hidden)
})

const hasChildren = computed(() => visibleChildren.value.length > 0)

// 拼接路径
function resolvePath(routePath) {
  if (routePath.startsWith('/')) return routePath
  // 去掉 base-path 末尾的斜杠，拼接子路径
  const base = props.basePath.replace(/\/$/, '')
  // 如果 base 已经包含了子路径前缀（如 /equipment），则子路径直接拼接
  if (base.endsWith(routePath)) return base
  // 对于 layout 下的子路由，base-path 就是父级路径
  // 需要处理：父级 path 是 /equipment，子级 path 是 list
  // 最终菜单路径应该是 /equipment/list
  // 但父组件传的 base-path 已经是 route.path（即 /equipment）
  // 子组件的 base-path 是 resolvePath(child.path)，即 /equipment/list —— 但这只会在递归时用到
  // 这里只需要把 base + '/' + routePath
  return `${base}/${routePath}`.replace(/\/+/g, '/')
}
</script>
