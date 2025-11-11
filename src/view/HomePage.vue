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

      <!-- 新建对话按钮 -->
      <div class="new-chat-section">
        <el-button 
          type="primary" 
          icon="el-icon-plus" 
          @click="startNewChat" 
          class="new-chat-btn"
          :disabled="activeTab !== 'generator'"
        >
          新建对话
        </el-button>
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
          <div class="submenu-header">
            <span>历史记录</span>
            <i class="el-icon-refresh refresh-icon" @click="refreshHistory" title="刷新"></i>
          </div>
          
          <!-- 今天 -->
          <div class="history-category-section">
            <div class="category-header" @click="toggleCategory('today')">
              <i class="el-icon-arrow-down category-arrow" :class="{ rotated: !expandedCategories.today }"></i>
              <span class="category-title">今天</span>
              <span class="category-count">{{ todayChats.length }}</span>
            </div>
            <div v-show="expandedCategories.today" class="category-content">
              <div 
                v-for="chat in todayChats" 
                :key="chat.id"
                :class="['history-item', { active: activeChatId === chat.id }]"
                @click="loadChat(chat.id)"
              >
                <i class="el-icon-chat-dot-round"></i>
                <div class="chat-info">
                  <span class="chat-title">{{ chat.title }}</span>
                  <span class="chat-time">{{ formatTime(chat.startTime) }}</span>
                </div>
                <i class="el-icon-more-outline chat-more" @click.stop="showChatActions(chat)"></i>
              </div>
              <div v-if="todayChats.length === 0" class="no-chats">
                <i class="el-icon-chat-line-round"></i>
                <p>暂无聊天记录</p>
              </div>
            </div>
          </div>
          
          <!-- 近7天 -->
          <div class="history-category-section">
            <div class="category-header" @click="toggleCategory('week')">
              <i class="el-icon-arrow-down category-arrow" :class="{ rotated: !expandedCategories.week }"></i>
              <span class="category-title">近7天</span>
              <span class="category-count">{{ weekChats.length }}</span>
            </div>
            <div v-show="expandedCategories.week" class="category-content">
              <div 
                v-for="chat in weekChats" 
                :key="chat.id"
                :class="['history-item', { active: activeChatId === chat.id }]"
                @click="loadChat(chat.id)"
              >
                <i class="el-icon-chat-dot-round"></i>
                <div class="chat-info">
                  <span class="chat-title">{{ chat.title }}</span>
                  <span class="chat-time">{{ formatTime(chat.startTime) }}</span>
                </div>
                <i class="el-icon-more-outline chat-more" @click.stop="showChatActions(chat)"></i>
              </div>
              <div v-if="weekChats.length === 0" class="no-chats">
                <i class="el-icon-chat-line-round"></i>
                <p>暂无聊天记录</p>
              </div>
            </div>
          </div>
          
          <!-- 近30天 -->
          <div class="history-category-section">
            <div class="category-header" @click="toggleCategory('month')">
              <i class="el-icon-arrow-down category-arrow" :class="{ rotated: !expandedCategories.month }"></i>
              <span class="category-title">近30天</span>
              <span class="category-count">{{ monthChats.length }}</span>
            </div>
            <div v-show="expandedCategories.month" class="category-content">
              <div 
                v-for="chat in monthChats" 
                :key="chat.id"
                :class="['history-item', { active: activeChatId === chat.id }]"
                @click="loadChat(chat.id)"
              >
                <i class="el-icon-chat-dot-round"></i>
                <div class="chat-info">
                  <span class="chat-title">{{ chat.title }}</span>
                  <span class="chat-time">{{ formatTime(chat.startTime) }}</span>
                </div>
                <i class="el-icon-more-outline chat-more" @click.stop="showChatActions(chat)"></i>
              </div>
              <div v-if="monthChats.length === 0" class="no-chats">
                <i class="el-icon-chat-line-round"></i>
                <p>暂无聊天记录</p>
              </div>
            </div>
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
      <TripGenerator 
        v-if="activeTab === 'generator'" 
        :currentChatId="activeChatId"
        :chatHistory="chatHistory"
        @chat-updated="handleChatUpdate"
        @new-chat-created="handleNewChatCreated"
      />
      <TripManagement v-if="activeTab === 'management'" />
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import TripGenerator from '../components/TripGenerator.vue';
import TripManagement from '../components/TripManager.vue';
import router from '../router';

const isLoggedIn = ref(false);
const username = ref('用户');
const activeTab = ref('generator');
const activeChatId = ref(null);
const chatHistory = ref({});
const expandedCategories = ref({
  today: false,
  week: false,
  month: false
});

// 模拟数据 - 30天内的聊天记录
const mockChatHistory = {
  'chat_1': {
    id: 'chat_1',
    title: '日本东京5日游',
    startTime: new Date().toISOString(),
    messages: [
      { role: 'user', content: '我想去日本东京旅游5天，预算1万元', timestamp: new Date().toISOString() },
      { role: 'assistant', content: '好的，为您规划东京5日游...', timestamp: new Date().toISOString() }
    ]
  },
  'chat_2': {
    id: 'chat_2',
    title: '京都文化之旅',
    startTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2天前
    messages: [
      { role: 'user', content: '我想去京都体验传统文化', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
      { role: 'assistant', content: '京都文化之旅规划中...', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() }
    ]
  },
  'chat_3': {
    id: 'chat_3',
    title: '大阪美食探索',
    startTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5天前
    messages: [
      { role: 'user', content: '想去大阪吃美食，有什么推荐？', timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
      { role: 'assistant', content: '大阪美食之旅规划...', timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() }
    ]
  },
  'chat_4': {
    id: 'chat_4',
    title: '北海道冬季之旅',
    startTime: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10天前
    messages: [
      { role: 'user', content: '冬季想去北海道看雪', timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() },
      { role: 'assistant', content: '北海道冬季旅行规划...', timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() }
    ]
  },
  'chat_5': {
    id: 'chat_5',
    title: '冲绳海岛度假',
    startTime: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15天前
    messages: [
      { role: 'user', content: '想去冲绳度假，有什么好玩的？', timestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString() },
      { role: 'assistant', content: '冲绳海岛度假规划...', timestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString() }
    ]
  },
  'chat_6': {
    id: 'chat_6',
    title: '名古屋商务旅行',
    startTime: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(), // 25天前
    messages: [
      { role: 'user', content: '要去名古屋出差，顺便旅游', timestamp: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString() },
      { role: 'assistant', content: '名古屋商务旅行规划...', timestamp: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString() }
    ]
  }
};

// 从本地存储加载聊天历史
const loadChatHistory = () => {
  const savedHistory = localStorage.getItem('travelChatHistory');
  if (savedHistory) {
    chatHistory.value = JSON.parse(savedHistory);
  } else {
    // 使用模拟数据
    chatHistory.value = mockChatHistory;
    activeChatId.value = 'chat_1';
    saveChatHistory();
  }
  
  // 如果没有活跃聊天，设置第一个
  if (!activeChatId.value || !chatHistory.value[activeChatId.value]) {
    const chatIds = Object.keys(chatHistory.value);
    if (chatIds.length > 0) {
      activeChatId.value = chatIds[0];
    }
  }
};

// 保存聊天历史到本地存储
const saveChatHistory = () => {
  localStorage.setItem('travelChatHistory', JSON.stringify(chatHistory.value));
};

// 生成聊天ID
const generateChatId = () => {
  return 'chat_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

// 开始新聊天
const startNewChat = () => {
  // 如果有当前聊天且不为空，先保存
  if (activeChatId.value && chatHistory.value[activeChatId.value] && 
      chatHistory.value[activeChatId.value].messages.length > 0) {
    chatHistory.value[activeChatId.value].startTime = new Date().toISOString();
    saveChatHistory();
  }
  
  // 创建新聊天
  const newChatId = generateChatId();
  chatHistory.value[newChatId] = {
    id: newChatId,
    title: '新的对话',
    startTime: new Date().toISOString(),
    messages: []
  };
  
  activeChatId.value = newChatId;
  saveChatHistory();
  
  ElMessage.success('已开始新对话');
};

// 加载聊天
const loadChat = (chatId) => {
  if (chatHistory.value[chatId]) {
    activeChatId.value = chatId;
  }
};

// 刷新历史记录
const refreshHistory = () => {
  loadChatHistory();
  ElMessage.success('历史记录已刷新');
};

// 切换分类展开状态
const toggleCategory = (category) => {
  expandedCategories.value[category] = !expandedCategories.value[category];
};

// 显示聊天操作菜单
const showChatActions = (chat) => {
  ElMessageBox.confirm(`确定要删除 "${chat.title}" 吗？`, '删除对话', {
    confirmButtonText: '删除',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    deleteChat(chat.id);
  }).catch(() => {});
};

// 删除聊天
const deleteChat = (chatId) => {
  if (chatHistory.value[chatId]) {
    // 如果删除的是当前活跃的聊天，需要切换到其他聊天
    if (activeChatId.value === chatId) {
      const remainingChats = Object.keys(chatHistory.value).filter(id => id !== chatId);
      if (remainingChats.length > 0) {
        activeChatId.value = remainingChats[0];
      } else {
        // 如果没有其他聊天，创建一个新的
        startNewChat();
      }
    }
    
    delete chatHistory.value[chatId];
    saveChatHistory();
    ElMessage.success('对话已删除');
  }
};

// 处理聊天更新
const handleChatUpdate = (chatData) => {
  if (activeChatId.value && chatHistory.value[activeChatId.value]) {
    chatHistory.value[activeChatId.value] = {
      ...chatHistory.value[activeChatId.value],
      ...chatData,
      startTime: chatData.startTime || chatHistory.value[activeChatId.value].startTime
    };
    saveChatHistory();
  }
};

// 处理新聊天创建
const handleNewChatCreated = (chatData) => {
  chatHistory.value[chatData.id] = chatData;
  activeChatId.value = chatData.id;
  saveChatHistory();
};

// 计算今天、近7天、近30天的聊天
const todayChats = computed(() => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return Object.values(chatHistory.value)
    .filter(chat => {
      const chatDate = new Date(chat.startTime);
      return chatDate >= today;
    })
    .sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
});

const weekChats = computed(() => {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  weekAgo.setHours(0, 0, 0, 0);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return Object.values(chatHistory.value)
    .filter(chat => {
      const chatDate = new Date(chat.startTime);
      return chatDate >= weekAgo && chatDate < today;
    })
    .sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
});

const monthChats = computed(() => {
  const monthAgo = new Date();
  monthAgo.setDate(monthAgo.getDate() - 30);
  monthAgo.setHours(0, 0, 0, 0);
  
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  weekAgo.setHours(0, 0, 0, 0);
  
  return Object.values(chatHistory.value)
    .filter(chat => {
      const chatDate = new Date(chat.startTime);
      return chatDate >= monthAgo && chatDate < weekAgo;
    })
    .sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
});

// 格式化时间显示
const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  
  if (diffMins < 1) {
    return '刚刚';
  } else if (diffMins < 60) {
    return `${diffMins}分钟前`;
  } else if (diffHours < 24) {
    return `${diffHours}小时前`;
  } else {
    const diffDays = Math.floor(diffMs / (24 * 3600000));
    return `${diffDays}天前`;
  }
};

onMounted(() => {
  const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
  isLoggedIn.value = loggedIn;
  if (loggedIn) {
    const savedUsername = localStorage.getItem('username') || '用户';
    username.value = savedUsername;
  }
  
  // 加载聊天历史
  loadChatHistory();
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
      localStorage.removeItem('userId');
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

/* 新建对话按钮区域 */
.new-chat-section {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.new-chat-btn {
  width: 100%;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.new-chat-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.new-chat-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.6);
  padding: 0.5rem 1rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
}

.refresh-icon {
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 0.2rem;
  border-radius: 4px;
}

.refresh-icon:hover {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
  transform: rotate(90deg);
}

.history-category-section {
  margin-bottom: 0.5rem;
}

.category-header {
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 600;
}

.category-header:hover {
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.9);
}

.category-arrow {
  font-size: 0.7rem;
  margin-right: 0.5rem;
  transition: transform 0.2s ease;
  color: rgba(255, 255, 255, 0.6);
}

.category-arrow.rotated {
  transform: rotate(-90deg);
}

.category-title {
  flex: 1;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.category-count {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  padding: 0.1rem 0.4rem;
  border-radius: 8px;
  font-size: 0.7rem;
  min-width: 20px;
  text-align: center;
}

.category-content {
  margin-left: 0.5rem;
  padding-left: 1rem;
  border-left: 1px solid rgba(255, 255, 255, 0.1);
}

.history-item {
  display: flex;
  align-items: center;
  padding: 0.6rem 0.8rem;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 6px;
  margin-bottom: 0.2rem;
  font-size: 0.85rem;
  position: relative;
}

.history-item:hover {
  background: rgba(255, 255, 255, 0.08);
  color: white;
}

.history-item.active {
  background: rgba(255, 255, 255, 0.12);
  color: white;
  font-weight: 500;
}

.history-item i:first-child {
  margin-right: 0.8rem;
  font-size: 0.9rem;
  width: 16px;
  text-align: center;
}

.chat-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chat-title {
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 0.1rem;
}

.chat-time {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.5);
  white-space: nowrap;
}

.chat-more {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.5);
  padding: 0.2rem;
  border-radius: 4px;
  transition: all 0.2s ease;
  opacity: 0;
}

.history-item:hover .chat-more {
  opacity: 1;
}

.chat-more:hover {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
}

.no-chats {
  text-align: center;
  padding: 1.5rem 0.5rem;
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.8rem;
}

.no-chats i {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  display: block;
  opacity: 0.6;
}

.no-chats p {
  margin: 0;
  font-style: italic;
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
    padding: 1rem;
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
  .logo h1 {
    font-size: 1.3rem;
  }
  
  .nav-item {
    padding: 0.7rem 1rem;
  }
  
  .user-section {
    padding: 0.8rem 1rem;
  }
  
  .history-item {
    padding: 0.5rem 0.8rem;
  }
  
  .chat-title {
    max-width: 120px;
  }
  
  .new-chat-section {
    padding: 0.8rem 1rem;
  }
}
</style>