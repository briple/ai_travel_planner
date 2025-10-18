<template>
  <div class="app-container">
    <!-- 导航栏 -->
    <header class="header">
      <div class="logo">
        <h1>AI 旅行助手</h1>
      </div>
      
      <!-- 导航菜单 -->
      <nav class="nav-menu">
        <el-button 
          :type="activeTab === 'generator' ? 'primary' : 'text'" 
          @click="switchTab('generator')"
          class="nav-btn"
        >
          旅游计划生成
        </el-button>
        <el-button 
          :type="activeTab === 'management' ? 'primary' : 'text'" 
          @click="switchTab('management')"
          class="nav-btn"
        >
          旅游计划管理
        </el-button>
      </nav>

      <!-- 用户信息 -->
      <div class="user-info">
        <template v-if="isLoggedIn">
          <el-dropdown @command="handleUserCommand">
            <span class="user-dropdown">
              <el-avatar :size="40" src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png" />
              <span class="username">{{ username }}</span>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人中心</el-dropdown-item>
                <el-dropdown-item command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
        <template v-else>
          <el-button type="primary" plain @click="goToLogin">登录</el-button>
        </template>
      </div>
    </header>

    <!-- 主内容区 -->
    <main class="main-content">
      <!-- 旅游计划生成组件 -->
      <TripGenerator v-if="activeTab === 'generator'" />
      
      <!-- 旅游计划管理组件 -->
      <TripManagement v-if="activeTab === 'management'" />
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import TripGenerator from '../components/TripGenerator.vue';
import TripManagement from '../components/TripManager.vue';

// 用户状态
const isLoggedIn = ref(false);
const username = ref('用户');
const activeTab = ref('generator');

// 检查登录状态
onMounted(() => {
  const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
  isLoggedIn.value = loggedIn;
  if (loggedIn) {
    const savedUsername = localStorage.getItem('username') || '用户';
    username.value = savedUsername;
  }
});

// 切换标签页
const switchTab = (tab) => {
  activeTab.value = tab;
};

// 用户操作
const handleUserCommand = (command) => {
  if (command === 'logout') {
    ElMessageBox.confirm('确定要退出登录吗？', '退出登录', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('username');
      isLoggedIn.value = false;
      ElMessage.success('已退出登录');
    }).catch(() => {
      // 取消
    });
  } else if (command === 'profile') {
    ElMessage.info('跳转到个人中心');
  }
};

// 跳转登录
const goToLogin = () => {
  ElMessage.info('跳转到登录页面');
};
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: linear-gradient(135deg, #e0f7e0 0%, #f0fdf4 100%);
  min-height: 100vh;
}

.app-container {
  min-height: 100vh;
}

/* 导航栏样式 */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 3rem;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(165, 225, 165, 0.3);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 100;
}

.logo h1 {
  font-size: 1.8rem;
  color: #0d9488;
  font-weight: 800;
  margin: 0;
  letter-spacing: 0.5px;
}

.nav-menu {
  display: flex;
  gap: 1rem;
}

.nav-btn {
  color: #0d9488;
  border-color: #10b981;
}

.nav-btn.is-active,
.nav-btn:hover {
  background: linear-gradient(135deg, #10b981 0%, #0d9488 100%);
  color: white;
  border-color: transparent;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.username {
  margin-left: 0.8rem;
  color: #0d9488;
  font-weight: 500;
}

.user-dropdown {
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.user-dropdown:hover {
  transform: scale(1.05);
}

/* 主内容区 */
.main-content {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 2rem;
}

/* 响应式 */
@media (max-width: 768px) {
  .header {
    flex-direction: column;
    padding: 1rem;
    gap: 1rem;
  }
  
  .nav-menu {
    width: 100%;
    justify-content: center;
  }
  
  .main-content {
    padding: 0 1rem;
    margin: 1rem auto;
  }
}
</style>