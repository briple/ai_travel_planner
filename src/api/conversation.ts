// api/conversationApi.ts

import http from '../utils/http'
import type { Conversation, ChatMessage } from '../types/conversation'
import type { ApiResponse } from '../types/api'

const CONVERSATION_PREFIX = '/api/conversation'

export const conversationApi = {
  /**
   * 创建新对话
   * @param userId 用户ID
   * @returns 对话ID
   */
  async createConversation(userId: number): Promise<ApiResponse<number>> {
    return http.post(CONVERSATION_PREFIX, null, {
      params: { userId }
    })
  },

  /**
   * 根据 conversationId 获取该对话的所有消息
   * @param conversationId 对话ID
   * @returns 消息列表
   */
  async getMessagesByConversationId(
    conversationId: number
  ): Promise<ApiResponse<ChatMessage[]>> {
    return http.get(`${CONVERSATION_PREFIX}/${conversationId}/messages`)
  },

  /**
   * 根据 userId 获取该用户的所有对话
   * @param userId 用户ID
   * @returns 对话列表
   */
  async getConversationsByUserId(
    userId: number
  ): Promise<ApiResponse<Conversation[]>> {
    return http.get(`${CONVERSATION_PREFIX}/user/${userId}`)
  }
}

export default conversationApi