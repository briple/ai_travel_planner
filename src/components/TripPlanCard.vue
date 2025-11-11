<template>
  <div class="trip-plan-card">
    <!-- 计划概要 -->
    <div class="summary">
      <h2>旅行计划：{{ plan.destination }}</h2>
      <p>📅 出发日期：{{ formatDate(plan.departureDate) }}</p>
      <p>⏳ 行程天数：{{ plan.duration }} 天</p>
      <p>💰 预算：¥{{ plan.budget }}（{{ plan.people }}人）</p>
      <p>🎯 偏好：{{ plan.preferences.join('、') }}</p>
    </div>

    <!-- 天数筛选器 -->
    <div class="filter-section">
      <label for="day-filter">筛选天数：</label>
      <select id="day-filter" v-model="selectedDay">
        <option value="">全部</option>
        <option
          v-for="day in plan.days"
          :key="day.day"
          :value="day.day"
        >
          第 {{ day.day }} 天（{{ day.date }}）
        </option>
      </select>
    </div>

    <!-- 每日行程 -->
    <div class="days-container">
      <div
        v-for="dayPlan in filteredDays"
        :key="dayPlan.day"
        class="day-plan"
      >
        <h3>第 {{ dayPlan.day }} 天 · {{ dayPlan.date }}</h3>
        <p class="weather">🌤️ {{ dayPlan.weatherSummary }}</p>

        <div class="activities">
          <div
            v-for="(activity, index) in dayPlan.activities"
            :key="index"
            class="activity"
          >
            <div class="time">{{ activity.time }}</div>
            <div class="content">
              <h4>{{ activity.title }}</h4>
              <p v-if="activity.location" class="location">📍 {{ activity.location }}</p>
              <p v-if="activity.fromLocation && activity.toLocation" class="route">
                🚶 从 {{ activity.fromLocation }} → {{ activity.toLocation }}
              </p>
              <p v-if="activity.transport" class="transport">🚇 {{ activity.transport }}</p>
              <p v-if="activity.durationMinutes !== null" class="duration">
                ⏱️ 耗时：{{ activity.durationMinutes }} 分钟
              </p>
              <p v-if="activity.desc" class="desc">{{ activity.desc }}</p>
              <p class="price">💰 ¥{{ activity.price }}</p>
              <span class="type-badge">{{ activity.type }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 旅行小贴士 -->
    <div v-if="plan.travelTips.length > 0" class="tips">
      <h3>📌 旅行小贴士</h3>
      <ul>
        <li v-for="(tip, i) in plan.travelTips" :key="i">{{ tip }}</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { TravelPlanVo } from '../types/travelPlan'

// Props
const props = defineProps<{
  plan: TravelPlanVo
}>()

// 筛选状态
const selectedDay = ref<number | ''>('')

// 格式化日期（处理 null 或无效值）
const formatDate = (dateStr: string | null): string => {
  if (!dateStr || dateStr === 'null') return '未指定'
  return dateStr
}

// 过滤后的天数
const filteredDays = computed(() => {
  if (selectedDay.value === '') {
    return props.plan.days
  }
  return props.plan.days.filter(day => day.day === selectedDay.value)
})
</script>

<style scoped>
.trip-plan-card {
  max-width: 800px;
  margin: 0 auto;
  padding: 16px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.summary h2 {
  color: #1a73e8;
  margin-bottom: 12px;
}

.summary p {
  margin: 4px 0;
  color: #555;
}

.filter-section {
  margin: 20px 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.filter-section select {
  padding: 6px 10px;
  border: 1px solid #ccc;
  border-radius: 6px;
}

.day-plan {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px dashed #eee;
}

.day-plan h3 {
  color: #333;
  margin-bottom: 8px;
}

.weather {
  color: #666;
  font-style: italic;
  margin-bottom: 12px;
}

.activities {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.activity {
  display: flex;
  gap: 12px;
  padding: 12px;
  background: #f9f9f9;
  border-radius: 8px;
}

.time {
  font-weight: bold;
  color: #1a73e8;
  min-width: 60px;
  text-align: center;
}

.content h4 {
  margin: 0 0 6px 0;
  color: #222;
}

.location,
.route,
.transport,
.duration,
.desc {
  margin: 2px 0;
  font-size: 0.95em;
  color: #444;
}

.price {
  margin-top: 6px;
  font-weight: bold;
  color: #d32f2f;
}

.type-badge {
  display: inline-block;
  margin-top: 6px;
  padding: 2px 8px;
  background: #e8f0fe;
  color: #1a73e8;
  border-radius: 12px;
  font-size: 0.85em;
}

.tips h3 {
  margin-top: 24px;
  color: #333;
}

.tips ul {
  padding-left: 20px;
  color: #555;
}
</style>