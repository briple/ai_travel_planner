<template>
  <div class="app-container">
    <!-- 导航栏 -->
    <header class="header">
      <div class="logo">
        <h1>AI 旅行助手</h1>
      </div>

      <!-- 导航菜单 -->
      <nav class="nav-menu">
        <div 
          :class="['nav-item', { active: activeTab === 'generator' }]"
          @click="switchTab('generator')"
        >
          <span class="nav-text">旅游计划生成</span>
          <div class="nav-underline"></div>
        </div>
        <div 
          :class="['nav-item', { active: activeTab === 'management' }]"
          @click="switchTab('management')"
        >
          <span class="nav-text">旅游计划管理</span>
          <div class="nav-underline"></div>
        </div>
      </nav>

      <!-- 用户信息 -->
      <div class="user-info">
        <template v-if="isLoggedIn">
          <el-dropdown @command="handleUserCommand">
            <span class="user-dropdown">
              <el-avatar :size="36" src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png" />
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
          <el-button type="primary" @click="goToLogin" class="login-btn">
            登录
          </el-button>
        </template>
      </div>
    </header>

    <!-- 主内容区 -->
    <main class="main-content">
      <TripGenerator v-if="activeTab === 'generator'" />
      <TripManagement v-if="activeTab === 'management'" />
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import TripGenerator from '../components/TripGenerator.vue';
import TripManagement from '../components/TripManager.vue';
import router from '../router';

const isLoggedIn = ref(false);
const username = ref('用户');
const activeTab = ref('generator');

onMounted(() => {
  const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
  isLoggedIn.value = loggedIn;
  if (loggedIn) {
    const savedUsername = localStorage.getItem('username') || '用户';
    username.value = savedUsername;
  }
});

const switchTab = (tab) => {
  activeTab.value = tab;
};

const handleUserCommand = (command) => {
  if (command === 'logout') {
    ElMessageBox.confirm('确定要退出登录吗？', '退出登录', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }).then(() => {
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('username');
      isLoggedIn.value = false;
      ElMessage.success('已退出登录');
      router.push('/login');
    }).catch(() => {
      // 取消
    });
  } else if (command === 'profile') {
    ElMessage.info('跳转到个人中心');
  }
};

const goToLogin = () => {
  router.push('/login');
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
  min-height: 85vh;
}

.app-container {
  min-height: 85vh;
}

/* ========== 优化后的导航栏 ========== */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8rem 3rem;
  background: linear-gradient(135deg, #e0f7e0 0%, #f0fdf4 100%);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(165, 225, 165, 0.4);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 0;
  z-index: 100;
  transition: all 0.3s ease;
  height: 45px; /* 固定高度，更紧凑 */
  min-height: 40px;
}

/* ========== Logo 艺术字风格 ========== */
.logo h1 {
  font-size: 1.8rem;
  font-weight: 800;
  letter-spacing: 1px;
  background: linear-gradient(135deg, #0d9488 0%, #10b981 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 2px 10px rgba(16, 185, 129, 0.2);
  margin: 0;
  font-family: 'Poppins', 'Inter', sans-serif;
}

/* ========== 导航菜单 - 文字与下划线完美对齐 ========== */
.nav-menu {
  display: flex;
  gap: 2.5rem;
}

.nav-item {
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 0.5rem 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.nav-text {
  font-size: 1.1rem;
  font-weight: 600;
  color: #64748b;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.nav-underline {
  height: 3px;
  width: 0;
  background: linear-gradient(135deg, #0d9488 0%, #10b981 100%);
  border-radius: 2px;
  transition: all 0.3s ease;
  margin-top: 2px;
}

.nav-item:hover .nav-text {
  color: #0d9488;
  transform: translateY(-1px);
}

.nav-item:hover .nav-underline {
  width: 100%;
}

.nav-item.active .nav-text {
  color: #0d9488;
  font-weight: 700;
}

.nav-item.active .nav-underline {
  width: 100%;
  animation: underlineExpand 0.3s ease-out;
}

@keyframes underlineExpand {
  from {
    width: 0;
  }
  to {
    width: 100%;
  }
}

/* ========== 用户信息区域 ========== */
.user-info {
  display: flex;
  align-items: center;
  gap: 1.2rem;
}

.username {
  font-weight: 600;
  color: #0d9488;
  font-size: 0.95rem;
}

.user-dropdown {
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
  gap: 8px;
}

.user-dropdown:hover {
  transform: scale(1.05);
}

/* ========== 登录按钮（统一风格） ========== */
.login-btn {
  background: linear-gradient(135deg, #10b981, #0d9488);
  color: white;
  border: none;
  padding: 0.5rem 1.4rem;
  border-radius: 18px;
  font-weight: 600;
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
  transition: all 0.3s ease;
  height: 40px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-btn:hover {
  background: linear-gradient(135deg, #0d9488, #0a6a7a);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(10, 106, 122, 0.4);
}

/* ========== 主内容区 ========== */
.main-content {
  max-width: 1200px;
  margin: 2.5rem auto;
  padding: 0 2rem;
}

/* ========== 响应式适配 ========== */
@media (max-width: 768px) {
  .header {
    flex-direction: row; /* 保持水平布局 */
    padding: 0.6rem 1.2rem;
    height: 56px;
    min-height: 56px;
    gap: 0.8rem;
  }

  .logo h1 {
    font-size: 1.5rem;
  }

  .nav-menu {
    flex: 1;
    justify-content: center;
    order: 2; /* 将导航菜单移到中间 */
    gap: 1.5rem;
  }

  .nav-text {
    font-size: 1rem;
  }

  .nav-item {
    padding: 0.3rem 0;
  }

  .user-info {
    order: 3; /* 用户信息移到最右边 */
    justify-content: flex-end;
  }

  .main-content {
    padding: 0 1rem;
    margin: 1.5rem auto;
  }
}

@media (max-width: 480px) {
  .nav-menu {
    gap: 1rem;
  }
  
  .nav-text {
    font-size: 0.9rem;
  }
}
</style>