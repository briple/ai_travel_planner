<!-- src/components/LoginPanel.vue -->
<template>
  <div class="login-container">
    <div class="background-gradient"></div>
    
    <div class="login-card">
      <div class="logo">
        <h1>AI 旅行助手</h1>
        <p class="animated-text">
          <span v-for="(char, index) in animatedText" :key="index" :style="{ animationDelay: `${index * 0.08}s` }">{{ char }}</span>
        </p>
      </div>

      <div class="login-tabs">
        <el-button 
          :type="currentTab === 'login' ? 'primary' : 'default'"
          :class="['tab-btn', { active: currentTab === 'login' }]"
          @click="currentTab = 'login'"
        >
          密码登录
        </el-button>
        <el-button 
          :type="currentTab === 'captcha' ? 'primary' : 'default'"
          :class="['tab-btn', { active: currentTab === 'captcha' }]"
          @click="currentTab = 'captcha'"
        >
          验证码登录
        </el-button>
        <el-button 
          :type="currentTab === 'register' ? 'primary' : 'default'"
          :class="['tab-btn', { active: currentTab === 'register' }]"
          @click="currentTab = 'register'"
        >
          注册
        </el-button>
      </div>

      <!-- 密码登录 -->
      <div v-if="currentTab === 'login'" class="login-form">
        <el-input
          v-model="loginForm.phone"
          type="tel"
          placeholder="手机号码"
          maxlength="11"
          @input="validatePhone"
          :class="{ 'is-error': phoneError }"
          class="input-field"
        >
          <template #prefix>
            <el-icon><User /></el-icon>
          </template>
        </el-input>
        <div v-if="phoneError" class="error">{{ phoneError }}</div>
        
        <el-input
          v-model="loginForm.password"
          type="password"
          placeholder="密码"
          :class="{ 'is-error': passwordError }"
          class="input-field"
        >
          <template #prefix>
            <el-icon><Lock /></el-icon>
          </template>
        </el-input>
        
        <el-button 
          type="primary" 
          class="submit-btn" 
          @click="handleLogin"
          :loading="loginLoading"
        >
          登录
        </el-button>
        <div class="extra-links">
          <el-link @click="currentTab = 'captcha'">验证码登录</el-link>
          <el-link @click="currentTab = 'register'">注册新账号</el-link>
        </div>
      </div>

      <!-- 验证码登录 -->
      <div v-if="currentTab === 'captcha'" class="login-form">
        <el-input
          v-model="captchaForm.phone"
          type="tel"
          placeholder="手机号码"
          maxlength="11"
          @input="validatePhone"
          :class="{ 'is-error': phoneError }"
          class="input-field"
        >
          <template #prefix>
            <el-icon><User /></el-icon>
          </template>
        </el-input>
        <div v-if="phoneError" class="error">{{ phoneError }}</div>
        
        <div class="captcha-row">
          <el-input
            v-model="captchaForm.code"
            type="text"
            placeholder="验证码"
            maxlength="6"
            class="input-field"
          >
            <template #prefix>
              <el-icon><Key /></el-icon>
            </template>
          </el-input>
          <el-button 
            :disabled="isSending" 
            class="send-btn"
            @click="sendCaptcha"
          >
            {{ isSending ? `${countdown}s` : '获取验证码' }}
          </el-button>
        </div>
        
        <el-button 
          type="primary" 
          class="submit-btn" 
          @click="handleCaptchaLogin"
          :loading="captchaLoading"
        >
          登录
        </el-button>
        <div class="extra-links">
          <el-link @click="currentTab = 'login'">密码登录</el-link>
          <el-link @click="currentTab = 'register'">注册新账号</el-link>
        </div>
      </div>

      <!-- 注册 -->
      <div v-if="currentTab === 'register'" class="login-form">
        <el-input
          v-model="registerForm.username"
          placeholder="用户名（2-10个字符）"
          class="input-field"
        >
          <template #prefix>
            <el-icon><User /></el-icon>
          </template>
        </el-input>
        
        <el-input
          v-model="registerForm.phone"
          type="tel"
          placeholder="手机号码"
          maxlength="11"
          @input="validatePhone"
          :class="{ 'is-error': phoneError }"
          class="input-field"
        >
          <template #prefix>
            <el-icon><User /></el-icon>
          </template>
        </el-input>
        <div v-if="phoneError" class="error">{{ phoneError }}</div>
        
        <el-input
          v-model="registerForm.password"
          type="password"
          placeholder="密码（6-16位）"
          class="input-field"
        >
          <template #prefix>
            <el-icon><Lock /></el-icon>
          </template>
        </el-input>
        
        <el-button 
          type="primary" 
          class="submit-btn" 
          @click="handleRegister"
          :loading="registerLoading"
        >
          注册
        </el-button>
        <div class="extra-links">
          <el-link @click="currentTab = 'login'">密码登录</el-link>
          <el-link @click="currentTab = 'captcha'">验证码登录</el-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { User, Lock, Key } from '@element-plus/icons-vue';

// 登录表单
const loginForm = ref({
  phone: '',
  password: ''
});

// 验证码表单
const captchaForm = ref({
  phone: '',
  code: ''
});

// 注册表单
const registerForm = ref({
  username: '',
  phone: '',
  password: ''
});

// 当前激活的标签
const currentTab = ref('login');

// 验证码相关
const isSending = ref(false);
const countdown = ref(60);
const timer = ref(null);

// 错误提示
const phoneError = ref('');
const passwordError = ref('');

// 加载状态
const loginLoading = ref(false);
const captchaLoading = ref(false);
const registerLoading = ref(false);

// 逐字动画
const animatedText = computed(() => {
  return '智能规划您的每一次旅程'.split('');
});

// 验证手机号
const validatePhone = () => {
  const phone = currentTab.value === 'register' ? registerForm.value.phone : 
                currentTab.value === 'captcha' ? captchaForm.value.phone : loginForm.value.phone;
  
  if (!phone) {
    phoneError.value = '手机号不能为空';
    return;
  }

  if (!/^1[3-9]\d{9}$/.test(phone)) {
    phoneError.value = '请输入有效的手机号';
  } else {
    phoneError.value = '';
  }
};

// 发送验证码
const sendCaptcha = () => {
  if (phoneError.value) return;
  
  isSending.value = true;
  countdown.value = 60;
  
  timer.value = setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) {
      clearInterval(timer.value);
      isSending.value = false;
    }
  }, 1000);
};

// 处理密码登录
const handleLogin = () => {
  if (phoneError.value) return;
  if (!loginForm.value.password) {
    passwordError.value = '密码不能为空';
    return;
  }
  
  loginLoading.value = true;
  
  // 模拟API调用
  setTimeout(() => {
    loginLoading.value = false;
    ElMessage.success('登录成功！');
  }, 1000);
};

// 处理验证码登录
const handleCaptchaLogin = () => {
  if (phoneError.value) return;
  if (!captchaForm.value.code) {
    ElMessage.error('请输入验证码');
    return;
  }
  
  captchaLoading.value = true;
  
  // 模拟API调用
  setTimeout(() => {
    captchaLoading.value = false;
    ElMessage.success('验证码登录成功！');
  }, 1000);
};

// 处理注册
const handleRegister = () => {
  if (phoneError.value) return;
  if (!registerForm.value.username) {
    ElMessage.error('用户名不能为空');
    return;
  }
  if (registerForm.value.username.length < 2 || registerForm.value.username.length > 10) {
    ElMessage.error('用户名需2-10个字符');
    return;
  }
  if (!registerForm.value.password) {
    ElMessage.error('密码不能为空');
    return;
  }
  if (registerForm.value.password.length < 6 || registerForm.value.password.length > 16) {
    ElMessage.error('密码需6-16位');
    return;
  }
  
  registerLoading.value = true;
  
  // 模拟API调用
  setTimeout(() => {
    registerLoading.value = false;
    ElMessage.success('注册成功！请登录');
    currentTab.value = 'login';
  }, 1000);
};

// 初始化时清除错误
onMounted(() => {
  phoneError.value = '';
  passwordError.value = '';
});
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;
  background: #f0fdf4;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.background-gradient {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #e0f7e0 0%, #f0fdf4 100%);
  z-index: -1;
  opacity: 0.9;
}

.login-card {
  width: 100%;
  max-width: 420px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: 24px;
  box-shadow: 0 15px 50px rgba(0, 0, 0, 0.08);
  padding: 3.5rem 3.2rem;
  position: relative;
  z-index: 1;
  transition: all 0.3s ease;
  border: 1px solid rgba(165, 225, 165, 0.5);
}

.logo {
  text-align: center;
  margin-bottom: 2.2rem;
}

.logo h1 {
  font-size: 2.4rem;
  color: #15803d;
  margin-bottom: 0.8rem;
  font-weight: 800;
  letter-spacing: 0.5px;
}

.animated-text {
  font-size: 1.1rem;
  color: #334155;
  font-weight: 500;
  line-height: 1.5;
  text-align: center;
  margin-top: 0.5rem;
  opacity: 0;
  animation: fadeIn 1.5s ease forwards;
}

.animated-text span {
  display: inline-block;
  opacity: 0;
  animation: fadeInChar 0.15s ease forwards;
  animation-delay: 0.05s;
}

@keyframes fadeIn {
  to {
    opacity: 1;
  }
}

@keyframes fadeInChar {
  to {
    opacity: 1;
  }
}

.login-tabs {
  display: flex;
  justify-content: space-between;
  margin-bottom: 2.5rem;
  gap: 12px;
}

.tab-btn {
  flex: 1;
  padding: 0.9rem 0;
  border: none;
  border-radius: 16px;
  font-weight: 600;
  font-size: 0.95rem;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.05);
  background: rgba(255, 255, 255, 0.7);
  color: #4a5568;
}

.tab-btn.active {
  background: linear-gradient(135deg, #10b981 0%, #0d9488 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
  transform: translateY(-2px);
}

.login-form {
  margin-top: 1.5rem;
}

.input-field {
  margin-bottom: 2rem; /* 增加间距 */
  border-radius: 16px;
  transition: all 0.3s ease;
}

.input-field .el-input__inner {
  height: 54px; /* 稍微增加高度 */
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.8);
  color: #2d3748;
  font-size: 1rem;
  transition: all 0.3s ease;
  padding: 0 1.6rem; /* 增加内边距，使输入框更宽 */
}

.input-field .el-input__inner:focus {
  outline: none;
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
  background: rgba(255, 255, 255, 0.9);
}

.input-field .el-input__prefix {
  color: #10b981;
  margin-right: 10px;
}

.input-field.is-error .el-input__inner {
  border-color: #ef4444;
  background: rgba(255, 255, 255, 0.9);
}

.error {
  color: #ef4444;
  font-size: 0.85rem;
  margin-top: 0.5rem;
  display: block;
  text-align: left;
  padding-left: 5px;
}

.submit-btn {
  width: 100%;
  padding: 1.2rem 0;
  background: linear-gradient(135deg, #10b981 0%, #0d9488 100%);
  color: white;
  border: none;
  border-radius: 16px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  letter-spacing: 0.5px;
  margin-bottom: 1.5rem;
  height: 56px;
  box-shadow: 0 4px 20px rgba(16, 185, 129, 0.3);
}

.submit-btn:hover {
  background: linear-gradient(135deg, #0e7490 0%, #0a6a7a 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 25px rgba(16, 185, 129, 0.4);
}

.submit-btn:active {
  transform: translateY(0);
}

.extra-links {
  text-align: center;
  color: #718096;
  font-size: 0.9rem;
  margin-top: 1.5rem;
}

.extra-links a {
  color: #10b981;
  margin: 0 0.5rem;
  text-decoration: none;
  transition: color 0.2s;
  font-weight: 500;
}

.extra-links a:hover {
  color: #0d9488;
  text-decoration: underline;
}

.captcha-row {
  display: flex;
  gap: 12px;
  margin-bottom: 2rem;
  align-items: center; /* 垂直居中对齐 */
}

.send-btn {
  background: #10b981;
  color: white;
  border: none;
  border-radius: 10px;
  padding: 0.9rem 1.3rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  min-width: 120px;
  height: 30px; /* 与输入框高度一致 */
  margin-bottom: 30px;
}

.send-btn:disabled {
  background: #0d9488;
  cursor: not-allowed;
}
</style>