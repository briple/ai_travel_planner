// types/travelPlan.ts

export interface TravelPlanVo {
  destination: string
  duration: number
  budget: number
  people: number
  preferences: string[]
  departureDate: string // 对应后端 @JsonProperty("departure_date")
  days: DayPlan[]
  travelTips: string[] // 对应后端 @JsonProperty("travel_tips")
}

export interface DayPlan {
  day: number
  date: string // "YYYY-MM-DD"
  weatherSummary: string // 对应 @JsonProperty("weather_summary")
  activities: Activity[]
}

export interface Activity {
  time: string // "HH:mm"
  title: string
  location: string
  desc: string
  type: string // e.g., "餐饮", "景点"
  fromLocation: string // 对应 @JsonProperty("from_location")
  toLocation: string   // 对应 @JsonProperty("to_location")
  transport: string
  durationMinutes: number | null // 对应 @JsonProperty("duration_minutes")
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