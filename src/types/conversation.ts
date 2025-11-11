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
  content: string
  timestamp: string // ISO 8601
}