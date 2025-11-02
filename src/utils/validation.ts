import type { FormRules } from 'element-plus'
import type { RegisterDto, LoginPasswordDto, LoginSmsCodeDto } from '../types/user'

/**
 * 手机号验证
 */
export const validatePhone = (phone: string): string => {
  if (!phone) {
    return '手机号不能为空'
  }
  if (!/^1[3-9]\d{9}$/.test(phone)) {
    return '请输入有效的手机号'
  }
  return ''
}

/**
 * 密码验证
 */
export const validatePassword = (password: string): string => {
  if (!password) {
    return '密码不能为空'
  }
  if (password.length < 6) {
    return '密码长度至少6位'
  }
  return ''
}

/**
 * 用户名验证
 */
export const validateUsername = (username: string): string => {
  if (!username) {
    return '用户名不能为空'
  }
  if (username.length < 2 || username.length > 10) {
    return '用户名需2-10个字符'
  }
  return ''
}

/**
 * 验证码验证
 */
export const validateSmsCode = (code: string): string => {
  if (!code) {
    return '验证码不能为空'
  }
  if (!/^\d{6}$/.test(code)) {
    return '验证码必须是6位数字'
  }
  return ''
}

/**
 * 确认密码验证
 */
export const validateConfirmPassword = (password: string, confirmPassword: string): string => {
  if (!confirmPassword) {
    return '请确认密码'
  }
  if (password !== confirmPassword) {
    return '两次输入的密码不一致'
  }
  return ''
}