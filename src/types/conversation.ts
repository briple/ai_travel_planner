// types/conversation.ts

export interface Conversation {
  id: number | string
  userId: number | string
  title?: string 
  timestamp: string //
}

export interface ChatMessage {
  id: number | string
  conversationId: number | string
  role: 'user' | 'assistant'
  message?: string
  timestamp: string // ISO 8601
  planId?: number | string // 可选，关联的旅行计划ID
}