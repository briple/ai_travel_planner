// types/travelPlan.ts

export interface TravelPlanVo {
  planId: number
  timestamp: string // ISO 8601
  status: string
  destination: string
  duration: number
  budget: number
  people: number
  preferences: string[]
  departure_date: string // 对应后端 @JsonProperty("departure_date")
  days: DayPlan[]
  travel_tips: string[] // 对应后端 @JsonProperty("travel_tips")
}

export interface DayPlan {
  day: number
  date: string // "YYYY-MM-DD"
  weather_summary: string // 对应 @JsonProperty("weather_summary")
  activities: Activity[]
}

export interface Activity {
  time: string // "HH:mm"
  title: string
  location: string
  
  // 新增经纬度字段
  latitude: number | null // 纬度，交通活动为 null
  longitude: number | null // 经度，交通活动为 null
  
  desc: string
  type: string // e.g., "餐饮", "景点", "交通"
  
  // 交通活动特有字段
  from_location: string   // 对应 @JsonProperty("from_location")
  to_location: string     // 对应 @JsonProperty("to_location")
  transport: string
  duration_minutes: number | null // 对应 @JsonProperty("duration_minutes")
  price: number
}


// 用于创建/更新请求的 DTO
export interface TravelPlanCreateDto {
  userId?: number | null
  conversationId?: number | null
  planContent: string // JSON 字符串，但通常前端传对象，由 service 层 stringify
}

export interface TravelPlanUpdateDto {
  id: number
  userId?: number | null
  conversationId?: number | null
  planContent: string // JSON 字符串
}