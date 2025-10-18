<!-- src/App.vue -->
<template>
  <div class="app-container">
    <LoginPanel />
  </div>
</template>

<script setup>
import LoginPanel from './components/LoginPanel.vue'
</script>

<style scoped>
html, body, #app {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
}
/* 确保容器占据整个视口 */
.app-container {
  min-height: 100vh;
  width: 100vw;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  /* 关键：清除所有默认间距 */
  margin: 0;
  padding: 0;
  overflow: hidden;
}
</style>