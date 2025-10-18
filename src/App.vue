<!-- src/App.vue -->
<template>
  <div class="app-container">
    <!-- 路由出口：当前匹配的页面组件会在这里渲染 -->
    <router-view />
  </div>
</template>

<script setup>
// 这里不需要导入 HomePage 或 LoginPage
// 路由会自动根据 URL 加载对应组件
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
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}
</style>