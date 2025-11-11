// api/travelPlanApi.ts

import http from '../utils/http'
import type { 
  TravelPlanVo, 
  TravelPlanUpdateDto 
} from '../types/travelPlan'
import type { ApiResponse } from '../types/api'

const PLAN_PREFIX = '/api/plan'

export const travelPlanApi = {
  /**
   * 根据 ID 获取旅行计划
   */
  async getTravelPlanById(planId: number): Promise<ApiResponse<TravelPlanVo>> {
    return http.get(`${PLAN_PREFIX}/get`, {
      params: { planId }
    })
  },

  /**
   * 根据用户 ID 查询所有旅行计划
   */
  async getPlansByUserId(userId: number): Promise<ApiResponse<TravelPlanVo[]>> {
    return http.get(`${PLAN_PREFIX}/listByUser`, {
      params: { userId }
    })
  },

  /**
   * 更新旅行计划
   */
  async updateTravelPlan(dto: TravelPlanUpdateDto): Promise<ApiResponse<TravelPlanVo>> {
    return http.post(`${PLAN_PREFIX}/update`, dto)
  },

  /**
   * 删除旅行计划
   */
  async deleteTravelPlan(id: number): Promise<ApiResponse<boolean>> {
    return http.post(`${PLAN_PREFIX}/delete`, null, {
      params: { id }
    })
  }
}

export default travelPlanApi