<!-- TripManagement.vue -->
<template>
  <div class="management-container">
    <div class="page-header">
      <h2 class="page-title">旅游计划管理</h2>
      <p class="page-desc">管理您的所有旅行计划，包括历史行程和收藏计划</p>
    </div>
    
    <!-- 操作栏 -->
    <div class="actions-bar">
      <el-button 
        type="success" 
        icon="el-icon-plus"
        :style="{ 
          'background': 'linear-gradient(135deg, #10b981 0%, #0d9488 100%)',
          'border-color': 'transparent',
          'color': 'white'
        }"
      >
        新建计划
      </el-button>
      <el-input
        v-model="searchQuery"
        placeholder="搜索您的旅行计划..."
        class="search-input"
        clearable
      />
    </div>
    
    <!-- 计划列表 -->
    <div class="plan-list">
      <el-empty 
        description="您还没有任何旅行计划，快去生成一个吧！"
        :image-size="200"
      >
        <template #image>
          <img src="https://cdn-icons-png.flaticon.com/512/2553/2553975.png" alt="旅行" style="width: 200px; opacity: 0.6;" />
        </template>
        <el-button 
          type="success"
          @click="goToGenerate"
          :style="{ 
            'background': 'linear-gradient(135deg, #10b981 0%, #0d9488 100%)',
            'border-color': 'transparent',
            'color': 'white'
          }"
        >
          开始规划旅行
        </el-button>
      </el-empty>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { ElMessage } from 'element-plus';

const searchQuery = ref('');

const goToGenerate = () => {
  // 切换到生成页面的逻辑
  ElMessage.info('跳转到旅行计划生成页面');
};
</script>

<style scoped>
.management-container {
  padding: 2rem 0;
}

.page-header {
  text-align: center;
  margin-bottom: 3rem;
}

.page-title {
  font-size: 2.2rem;
  color: #0d9488;
  margin-bottom: 1rem;
  font-weight: 800;
}

.page-desc {
  color: #64748b;
  font-size: 1.1rem;
}

.actions-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  gap: 1rem;
}

.search-input {
  max-width: 300px;
}

.plan-list {
  background: white;
  border-radius: 20px;
  padding: 3rem;
  box-shadow: 0 10px 40px rgba(13, 148, 136, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.2);
}

/* 响应式 */
@media (max-width: 768px) {
  .actions-bar {
    flex-direction: column;
  }
  
  .search-input {
    width: 100%;
    max-width: none;
  }
}
</style>