/**
 * 后端统一响应格式
 */
export interface ApiResponse<T = any> {
  code: string | number;
  message: string;
  data: T;
}
