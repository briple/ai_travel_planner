// api/generatePlanApi.ts

import http from '../utils/http'
import type { GeneratePlanParams } from '../types/generatePlan'
import type { TravelPlanVo } from '../types/travelPlan'
import type { ApiResponse } from '../types/api'

const GENERATE_PREFIX = '/api/generate'

export const generatePlanApi = {
  /**
   * 开始生成新的旅行计划
   */
  async startGenerate(params: GeneratePlanParams): Promise<ApiResponse<TravelPlanVo>> {
    return http.get(`${GENERATE_PREFIX}/start`, {
      params
    })
  },

  /**
   * 继续生成（基于已有对话上下文）
   */
  async continueGenerate(params: GeneratePlanParams): Promise<ApiResponse<TravelPlanVo>> {
    return http.get(`${GENERATE_PREFIX}/continue`, {
      params
    })
  }
}

export default generatePlanApi