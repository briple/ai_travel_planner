<template>
  <div class="app-container">
    <!-- 左侧导航栏 -->
    <aside class="sidebar">
      <!-- Logo区域 -->
      <div class="logo-section">
        <div class="logo">
          <h1>AI 旅行助手</h1>
        </div>
      </div>

      <!-- 导航菜单 -->
      <nav class="nav-menu">
        <div 
          :class="['nav-item', { active: activeTab === 'generator' }]"
          @click="switchTab('generator')"
        >
          <i class="el-icon-s-promotion nav-icon"></i>
          <span class="nav-text">旅游计划生成</span>
          <i v-if="activeTab === 'generator'" class="el-icon-arrow-right nav-arrow"></i>
        </div>
        
        <!-- 历史记录子菜单 -->
        <div v-if="activeTab === 'generator'" class="history-submenu">
          <div class="submenu-header">历史记录</div>
          <div 
            v-for="category in historyCategories" 
            :key="category.key"
            :class="['history-category', { active: activeHistoryCategory === category.key }]"
            @click="activeHistoryCategory = category.key"
          >
            <i :class="category.icon"></i>
            <span>{{ category.name }}</span>
            <span class="count">{{ category.count }}</span>
          </div>
        </div>

        <div 
          :class="['nav-item', { active: activeTab === 'management' }]"
          @click="switchTab('management')"
        >
          <i class="el-icon-folder-opened nav-icon"></i>
          <span class="nav-text">旅游计划管理</span>
          <i v-if="activeTab === 'management'" class="el-icon-arrow-right nav-arrow"></i>
        </div>
      </nav>

      <!-- 用户信息固定在左下角 -->
      <div class="user-section">
        <template v-if="isLoggedIn">
          <el-dropdown @command="handleUserCommand" placement="top-start">
            <div class="user-info">
              <el-avatar :size="36" src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png" />
              <div class="user-details">
                <span class="username">{{ username }}</span>
                <span class="user-status">在线</span>
              </div>
              <i class="el-icon-more user-more"></i>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">
                  <i class="el-icon-user"></i>
                  个人中心
                </el-dropdown-item>
                <el-dropdown-item command="logout" divided>
                  <i class="el-icon-switch-button"></i>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
        <template v-else>
          <el-button type="primary" @click="goToLogin" class="login-btn">
            <i class="el-icon-user"></i>
            登录
          </el-button>
        </template>
      </div>
    </aside>

    <!-- 右侧主内容区 -->
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
const activeHistoryCategory = ref('today');

// 历史记录分类
const historyCategories = ref([
  { key: 'today', name: '今天', icon: 'el-icon-sunny', count: 3 },
  { key: 'week', name: '七天内', icon: 'el-icon-date', count: 12 },
  { key: 'month', name: '30天内', icon: 'el-icon-calendar', count: 28 }
]);

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
  // 切换到生成器时默认选中今天分类
  if (tab === 'generator') {
    activeHistoryCategory.value = 'today';
  }
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
  background-color: #f8fafc;
  min-height: 100vh;
}

.app-container {
  display: flex;
  min-height: 100vh;
  background-color: #f8fafc;
}

/* ========== 左侧导航栏 ========== */
.sidebar {
  width: 280px;
  background: linear-gradient(135deg, #0d9488 0%, #10b981 100%);
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  z-index: 100;
  box-shadow: 4px 0 20px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
}

/* Logo区域 */
.logo-section {
  padding: 1.5rem 1.5rem 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo h1 {
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: 0.5px;
  color: white;
  margin: 0;
  font-family: 'Poppins', 'Inter', sans-serif;
  text-align: center;
}

/* 导航菜单 */
.nav-menu {
  flex: 1;
  padding: 1rem 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 0.8rem 1.5rem;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  margin: 0 0.5rem;
  border-radius: 8px;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  transform: translateX(4px);
}

.nav-item.active {
  background: rgba(255, 255, 255, 0.15);
  color: white;
  font-weight: 600;
}

.nav-icon {
  font-size: 1.2rem;
  margin-right: 0.8rem;
  width: 20px;
  text-align: center;
}

.nav-text {
  flex: 1;
  font-size: 0.95rem;
  font-weight: 500;
}

.nav-arrow {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.6);
}

/* 历史记录子菜单 */
.history-submenu {
  margin: 0.5rem 0 1rem;
  padding: 0 1rem;
}

.submenu-header {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.6);
  padding: 0.5rem 1rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
}

.history-category {
  display: flex;
  align-items: center;
  padding: 0.6rem 1rem;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 6px;
  margin-bottom: 0.2rem;
  font-size: 0.9rem;
}

.history-category:hover {
  background: rgba(255, 255, 255, 0.08);
  color: white;
}

.history-category.active {
  background: rgba(255, 255, 255, 0.12);
  color: white;
  font-weight: 500;
}

.history-category i {
  margin-right: 0.8rem;
  font-size: 1rem;
  width: 16px;
  text-align: center;
}

.count {
  margin-left: auto;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  padding: 0.1rem 0.5rem;
  border-radius: 10px;
  font-size: 0.75rem;
  min-width: 24px;
  text-align: center;
}

/* 用户信息区域固定在左下角 */
.user-section {
  padding: 1rem 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  margin-top: auto;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 0.5rem;
  border-radius: 8px;
}

.user-info:hover {
  background: rgba(255, 255, 255, 0.1);
}

.user-details {
  flex: 1;
  margin-left: 0.8rem;
  display: flex;
  flex-direction: column;
}

.username {
  color: white;
  font-weight: 600;
  font-size: 0.9rem;
}

.user-status {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.75rem;
  margin-top: 0.1rem;
}

.user-more {
  color: rgba(255, 255, 255, 0.7);
  font-size: 1rem;
}

/* 登录按钮 */
.login-btn {
  width: 100%;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  padding: 0.8rem;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.login-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

/* ========== 右侧主内容区 ========== */
.main-content {
  flex: 1;
  margin-left: 280px;
  padding: 2rem;
  background-color: #f8fafc;
  min-height: 100vh;
  overflow-y: auto;
}

/* ========== 响应式适配 ========== */
@media (max-width: 1024px) {
  .sidebar {
    width: 240px;
  }
  
  .main-content {
    margin-left: 240px;
    padding: 1.5rem;
  }
}

@media (max-width: 768px) {
  .sidebar {
    width: 220px;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }
  
  .sidebar.mobile-open {
    transform: translateX(0);
  }
  
  .main-content {
    margin-left: 0;
    width: 100%;
  }
  
  /* 移动端菜单按钮 */
  .mobile-menu-toggle {
    position: fixed;
    top: 1rem;
    left: 1rem;
    z-index: 101;
    background: #0d9488;
    color: white;
    border: none;
    border-radius: 6px;
    padding: 0.5rem;
    font-size: 1.2rem;
    cursor: pointer;
  }
}

@media (max-width: 480px) {
  .main-content {
    padding: 1rem;
  }
  
  .logo h1 {
    font-size: 1.3rem;
  }
  
  .nav-item {
    padding: 0.7rem 1rem;
  }
  
  .user-section {
    padding: 0.8rem 1rem;
  }
}
</style>