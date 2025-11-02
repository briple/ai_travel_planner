import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { authApi } from '../api/auth'
import type { 
  LoginPasswordDto, 
  LoginSmsCodeDto, 
  RegisterDto, 
  UserVo 
} from '../types/user'
import { 
  validatePhone, 
  validatePassword, 
  validateUsername, 
  validateSmsCode,
} from '../utils/validation'
import router from '../router'

export function useAuth() {
  const loginLoading = ref(false)
  const smsCodeLoading = ref(false)
  const registerLoading = ref(false)

  /**
   * 密码登录
   */
  const loginByPassword = async (loginData: LoginPasswordDto): Promise<UserVo | null> => {
    // 表单验证
    const phoneError = validatePhone(loginData.phone)
    const passwordError = validatePassword(loginData.password)
    
    if (phoneError || passwordError) {
      if (phoneError) ElMessage.error(phoneError)
      if (passwordError) ElMessage.error(passwordError)
      return null
    }

    loginLoading.value = true
    try {
      const response = await authApi.loginByPassword(loginData)
      ElMessage.success(response.message || '登录成功！')
      console.log(response)
      // 存储用户信息
       localStorage.setItem('username', response.username)
      localStorage.setItem('isLoggedIn', 'true')
      router.push('/')
      return response.data
    } catch (error: any) {
      console.error('登录失败:', error)
      ElMessage.error(error.response?.data?.message || '登录失败，请重试')
      return null
    } finally {
      loginLoading.value = false
    }
  }

  /**
   * 短信验证码登录
   */
  const loginBySmsCode = async (loginData: LoginSmsCodeDto): Promise<UserVo | null> => {
    // 表单验证
    const phoneError = validatePhone(loginData.phone)
    const smsCodeError = validateSmsCode(loginData.smsCode)
    
    if (phoneError || smsCodeError) {
      if (phoneError) ElMessage.error(phoneError)
      if (smsCodeError) ElMessage.error(smsCodeError)
      return null
    }

    smsCodeLoading.value = true
    try {
      const response = await authApi.loginBySmsCode(loginData)
      ElMessage.success(response.message || '验证码登录成功！')
      
      // 存储用户信息
        localStorage.setItem('username', response.username)
      localStorage.setItem('isLoggedIn', 'true')
      router.push('/')
      return response.data
    } catch (error: any) {
      console.error('验证码登录失败:', error)
      ElMessage.error(error.response?.data?.message || '登录失败，请重试')
      return null
    } finally {
      smsCodeLoading.value = false
    }
  }

  /**
   * 用户注册
   */
  const register = async (registerData: RegisterDto): Promise<UserVo | null> => {
    // 表单验证
    const usernameError = validateUsername(registerData.username)
    const phoneError = validatePhone(registerData.phone)
    const passwordError = validatePassword(registerData.password)
    
    if (usernameError || phoneError || passwordError) {
      if (usernameError) ElMessage.error(usernameError)
      if (phoneError) ElMessage.error(phoneError)
      if (passwordError) ElMessage.error(passwordError)
      return null
    }

    registerLoading.value = true
    try {
      const response = await authApi.register(registerData)
      ElMessage.success(response.message || '注册成功！')
      return response.data
    } catch (error: any) {
      console.error('注册失败:', error)
      ElMessage.error(error.response?.data?.message || '注册失败，请重试')
      return null
    } finally {
      registerLoading.value = false
    }
  }

  /**
   * 发送短信验证码（统一接口）
   */
  const sendSmsCode = async (phone: string): Promise<boolean> => {
    const phoneError = validatePhone(phone)
    if (phoneError) {
      ElMessage.error(phoneError)
      return false
    }

    smsCodeLoading.value = true
    try {
      await authApi.sendSmsCode(phone)
      ElMessage.success('验证码发送成功')
      return true
    } catch (error: any) {
      console.error('发送验证码失败:', error)
      ElMessage.error(error.response?.data?.message || '发送验证码失败')
      return false
    } finally {
      smsCodeLoading.value = false
    }
  }

  /**
   * 退出登录
   */
  const logout = (): void => {
    localStorage.removeItem('userInfo')
    localStorage.removeItem('isLoggedIn')
    ElMessage.success('已退出登录')
  }

  /**
   * 检查登录状态
   */
  const checkLoginStatus = (): boolean => {
    return localStorage.getItem('isLoggedIn') === 'true'
  }

  /**
   * 获取用户信息
   */
  const getUserInfo = (): UserVo | null => {
    const userInfo = localStorage.getItem('userInfo')
    return userInfo ? JSON.parse(userInfo) : null
  }

  return {
    loginLoading,
    smsCodeLoading,
    registerLoading,
    loginByPassword,
    loginBySmsCode,
    register,
    sendSmsCode,
    logout,
    checkLoginStatus,
    getUserInfo
  }
}