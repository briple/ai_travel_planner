/**
 * 注册请求参数
 */
export interface RegisterDto {
  username: string;
  phone: string;
  password: string;
}

/**
 * 密码登录请求参数
 */
export interface LoginPasswordDto {
  phone: string;
  password: string;
}

/**
 * 短信登录请求参数
 */
export interface LoginSmsCodeDto {
  phone: string;
  smsCode: string;
}

/**
 * 用户信息响应
 */
export interface UserVo {
  id?: number;
  username: string;
  phone: string;
  lastLoginAt?: string;
  createdAt?: string;
}

/**
 * API通用响应格式
 */
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
  timestamp?: string;
}