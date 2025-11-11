<!-- src/App.vue -->
<template>
  <div class="app-container">
    <!-- 路由出口：当前匹配的页面组件会在这里渲染 -->
    <router-view />
  </div>
</template>

<script setup lang="ts">

import { onMounted, onUnmounted } from 'vue'

const EDGE_THRESHOLD = 30 // 建议设为 30~50px，1000 太大了（几乎全屏都拦截）

const preventEdgeSwipe = (e: TouchEvent) => {
  if (!e.touches?.length) return

  const x = e.touches[0].clientX
  const screenWidth = window.innerWidth

  // 仅当触摸起始于左右边缘时，才阻止滑动（避免影响内部滚动）
  if (x < EDGE_THRESHOLD || x > screenWidth - EDGE_THRESHOLD) {
    // 关键：阻止 touchmove 的默认行为
    e.preventDefault()
  }
}

onMounted(() => {
  // 监听 touchmove，不是 touchstart！
  document.addEventListener('touchmove', preventEdgeSwipe, { passive: false })
})

onUnmounted(() => {
  document.removeEventListener('touchmove', preventEdgeSwipe)
})

</script>

<style scoped>
/* 确保容器占据整个视口 */
.app-container {
  min-height: 100vh;
  width: 100vw;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  margin: 0;
  padding: 0;
  overflow: hidden;
}
</style>

<!-- 全局样式可放在 index.css 或这里使用非 scoped style -->
<style>
html, body, #app {
  overscroll-behavior-x: none;
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}
</style>