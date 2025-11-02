<template>
  <div class="login-container">
    <div class="background-gradient"></div>
    
    <div class="login-card">
      <!-- 返回按钮 -->
      <div class="back-btn">
        <el-button 
          :icon="ArrowLeft" 
          circle 
          @click="router.push('/')"
          size="small"
        />
      </div>

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
          @input="validatePhone('login')"
          :class="{ 'is-error': loginPhoneError }"
          class="input-field"
        >
          <template #prefix>
            <el-icon><User /></el-icon>
          </template>
        </el-input>
        <div v-if="loginPhoneError" class="error">{{ loginPhoneError }}</div>
        
        <el-input
          v-model="loginForm.password"
          type="password"
          placeholder="密码"
          @blur="validatePassword('login')"
          :class="{ 'is-error': loginPasswordError }"
          class="input-field"
        >
          <template #prefix>
            <el-icon><Lock /></el-icon>
          </template>
        </el-input>
        <div v-if="loginPasswordError" class="error">{{ loginPasswordError }}</div>
        
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
          @input="validatePhone('captcha')"
          :class="{ 'is-error': captchaPhoneError }"
          class="input-field"
        >
          <template #prefix>
            <el-icon><User /></el-icon>
          </template>
        </el-input>
        <div v-if="captchaPhoneError" class="error">{{ captchaPhoneError }}</div>
        
        <div class="captcha-row">
          <el-input
            v-model="captchaForm.code"
            type="text"
            placeholder="验证码"
            maxlength="6"
            @blur="validateSmsCode"
            :class="{ 'is-error': smsCodeError }"
            class="input-field"
          >
            <template #prefix>
              <el-icon><Key /></el-icon>
            </template>
          </el-input>
          <el-button 
            :disabled="isSending || !!captchaPhoneError" 
            class="send-btn"
            @click="sendCaptcha"
            :loading="smsCodeLoading"
          >
            {{ isSending ? `${countdown}s` : '获取验证码' }}
          </el-button>
        </div>
        <div v-if="smsCodeError" class="error">{{ smsCodeError }}</div>
        
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
          @blur="validateUsername"
          :class="{ 'is-error': usernameError }"
          class="input-field"
        >
          <template #prefix>
            <el-icon><User /></el-icon>
          </template>
        </el-input>
        <div v-if="usernameError" class="error">{{ usernameError }}</div>
        
        <el-input
          v-model="registerForm.phone"
          type="tel"
          placeholder="手机号码"
          maxlength="11"
          @input="validatePhone('register')"
          :class="{ 'is-error': registerPhoneError }"
          class="input-field"
        >
          <template #prefix>
            <el-icon><User /></el-icon>
          </template>
        </el-input>
        <div v-if="registerPhoneError" class="error">{{ registerPhoneError }}</div>
        
        <el-input
          v-model="registerForm.password"
          type="password"
          placeholder="密码（6-16位）"
          @blur="validatePassword('register')"
          :class="{ 'is-error': registerPasswordError }"
          class="input-field"
        >
          <template #prefix>
            <el-icon><Lock /></el-icon>
          </template>
        </el-input>
        <div v-if="registerPasswordError" class="error">{{ registerPasswordError }}</div>
        
        <el-input
          v-model="registerForm.confirmPassword"
          type="password"
          placeholder="确认密码"
          @blur="validateConfirmPassword"
          :class="{ 'is-error': passwordConfirmError }"
          class="input-field"
        >
          <template #prefix>
            <el-icon><Lock /></el-icon>
          </template>
        </el-input>
        <div v-if="passwordConfirmError" class="error">{{ passwordConfirmError }}</div>
        
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
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { ElMessage } from 'element-plus';
import { User, Lock, Key, ArrowLeft } from '@element-plus/icons-vue';
import { useRouter } from 'vue-router';
import { useAuth } from '../composables/useAuth';

const router = useRouter();
const {
  loginLoading,
  smsCodeLoading,
  registerLoading,
  loginByPassword,
  loginBySmsCode,
  register,
  sendSmsCode
} = useAuth();

// 登录表单
const loginForm = ref({
  phone: '',
  password: ''
});

// 验证码表单
const captchaForm = ref({
  phone: '',
  smsCode: ''
});

// 注册表单
const registerForm = ref({
  username: '',
  phone: '',
  password: '',
  confirmPassword: ''
});

// 当前激活的标签
const currentTab = ref('login');

// 验证码相关
const isSending = ref(false);
const countdown = ref(0);
const timer = ref(null);

// 错误提示
const loginPhoneError = ref('');
const loginPasswordError = ref('');
const captchaPhoneError = ref('');
const registerPhoneError = ref('');
const usernameError = ref('');
const registerPasswordError = ref('');
const passwordConfirmError = ref('');
const smsCodeError = ref('');

// 逐字动画
const animatedText = computed(() => {
  return '智能规划您的每一次旅程'.split('');
});

// 表单校验函数
const validatePhone = (type) => {
  const phone = type === 'login' ? loginForm.value.phone : 
                type === 'captcha' ? captchaForm.value.phone : 
                registerForm.value.phone;
  
  if (!phone) {
    setPhoneError(type, '手机号不能为空');
    return false;
  }

  if (!/^1[3-9]\d{9}$/.test(phone)) {
    setPhoneError(type, '请输入有效的手机号');
    return false;
  } else {
    setPhoneError(type, '');
    return true;
  }
};

const setPhoneError = (type, message) => {
  switch (type) {
    case 'login':
      loginPhoneError.value = message;
      break;
    case 'captcha':
      captchaPhoneError.value = message;
      break;
    case 'register':
      registerPhoneError.value = message;
      break;
  }
};

const validatePassword = (type) => {
  const password = type === 'login' ? loginForm.value.password : registerForm.value.password;
  
  if (!password) {
    setPasswordError(type, '密码不能为空');
    return false;
  }

  if (password.length < 6 || password.length > 16) {
    setPasswordError(type, '密码需6-16位');
    return false;
  } else {
    setPasswordError(type, '');
    return true;
  }
};

const setPasswordError = (type, message) => {
  if (type === 'login') {
    loginPasswordError.value = message;
  } else {
    registerPasswordError.value = message;
  }
};

const validateUsername = () => {
  if (!registerForm.value.username) {
    usernameError.value = '用户名不能为空';
    return false;
  }

  if (registerForm.value.username.length < 2 || registerForm.value.username.length > 10) {
    usernameError.value = '用户名需2-10个字符';
    return false;
  } else {
    usernameError.value = '';
    return true;
  }
};

const validateSmsCode = () => {
  if (!captchaForm.value.code) {
    smsCodeError.value = '验证码不能为空';
    return false;
  }

  if (!/^\d{6}$/.test(captchaForm.value.code)) {
    smsCodeError.value = '验证码为6位数字';
    return false;
  } else {
    smsCodeError.value = '';
    return true;
  }
};

const validateConfirmPassword = () => {
  if (!registerForm.value.confirmPassword) {
    passwordConfirmError.value = '请确认密码';
    return false;
  }

  if (registerForm.value.password !== registerForm.value.confirmPassword) {
    passwordConfirmError.value = '两次输入的密码不一致';
    return false;
  } else {
    passwordConfirmError.value = '';
    return true;
  }
};

// 发送验证码
const sendCaptcha = async () => {
  if (!validatePhone('captcha')) return;
  
  const success = await sendSmsCode(captchaForm.value.phone);
  if (success) {
    startCountdown();
  }
};

// 开始倒计时
const startCountdown = () => {
  isSending.value = true;
  countdown.value = 60;
  
  timer.value = setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) {
      clearInterval(timer.value);
      isSending.value = false;
      timer.value = null;
    }
  }, 1000);
};

// 处理密码登录
const handleLogin = async () => {
  if (!validatePhone('login') || !validatePassword('login')) return;
  
  const loginData = {
    phone: loginForm.value.phone,
    password: loginForm.value.password
  };
  
  const user = await loginByPassword(loginData);
};

// 处理验证码登录
const handleCaptchaLogin = async () => {
  if (!validatePhone('captcha') || !validateSmsCode()) return;
  
  const loginData = {
    phone: captchaForm.value.phone,
    smsCode: captchaForm.value.code
  };
  
  const user = await loginBySmsCode(loginData);
};

// 处理注册
const handleRegister = async () => {
  if (!validateUsername() || !validatePhone('register') || 
      !validatePassword('register') || !validateConfirmPassword()) return;
  
  const registerData = {
    username: registerForm.value.username,
    phone: registerForm.value.phone,
    password: registerForm.value.password
  };
  
  const user = await register(registerData);
  if (user) {
    ElMessage.success('注册成功！请登录...');
    const loginData = {
      phone: registerForm.value.phone
    };
    registerForm.value = {
      username: '',
      phone: '',
      password: '',
      confirmPassword: ''
    };
    currentTab = ref('login');
  }
};

// 清理定时器
onUnmounted(() => {
  if (timer.value) {
    clearInterval(timer.value);
  }
});

// 初始化时清除错误
onMounted(() => {
  loginPhoneError.value = '';
  loginPasswordError.value = '';
  captchaPhoneError.value = '';
  registerPhoneError.value = '';
  usernameError.value = '';
  registerPasswordError.value = '';
  passwordConfirmError.value = '';
  smsCodeError.value = '';
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

.back-btn {
  position: absolute;
  top: 1.2rem;
  left: 1.2rem;
  z-index: 2;
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
  margin-bottom: 0.5rem;
  border-radius: 16px;
  transition: all 0.3s ease;
}

.input-field .el-input__inner {
  height: 54px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.8);
  color: #2d3748;
  font-size: 1rem;
  transition: all 0.3s ease;
  padding: 0 1.6rem;
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
  display: block;
  text-align: left;
  padding-left: 5px;
  margin-bottom: 1rem;
  min-height: 1.2rem;
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
  margin-top: 1.5rem;
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
  align-items: flex-start;
}

.captcha-row .input-field {
  flex: 1;
  margin-bottom: 0;
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
  height: 36px;
  white-space: nowrap;
}

.send-btn:disabled {
  background: #ced8d0;
  cursor: not-allowed;
}

.send-btn:not(:disabled):hover {
  background: #0d9488;
}
</style>