import http from '../utils/http'
import type { 
  LoginPasswordDto, 
  LoginSmsCodeDto, 
  RegisterDto, 
  UserVo,
} from '../types/user'
import type { ApiResponse } from '../types/api'
const USER_PREFIX = '/api/user'

export const authApi = {
  /**
   * 用户注册
   */
  async register(registerData: RegisterDto): Promise<ApiResponse<UserVo>> {
    return http.post(USER_PREFIX+'/register', registerData)
  },

  /**
   * 密码登录
   */
  async loginByPassword(loginData: LoginPasswordDto): Promise<ApiResponse<UserVo>> {
    return http.post(USER_PREFIX+'/login/password', loginData)
  },

  /**
   * 短信验证码登录
   */
  async loginBySmsCode(loginData: LoginSmsCodeDto): Promise<ApiResponse<UserVo>> {
    return http.post(USER_PREFIX+'/login/sms-code', loginData)
  },

  /**
   * 发送短信验证码（统一接口，不区分登录/注册）
   * 根据后端接口，只有一个发送验证码的接口
   */
  async sendSmsCode(phone: string): Promise<ApiResponse<null>> {
    return http.post(USER_PREFIX+'/send/sms-code', null, {
      params: { phone }
    })
  }
}

export default authApi