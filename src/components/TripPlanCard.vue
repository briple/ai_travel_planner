<template>
  <div class="trip-plan-card">
    <!-- 计划概要（始终显示） -->
    <div class="summary">
      <h2>旅行计划：{{ plan.destination }}</h2>

      <!-- 两行概要信息 -->
      <div class="summary-grid">
        <span>📅 出发日期：{{ formatDate(plan.departureDate) }}</span>
        <span>⏳ 行程天数：{{ plan.duration }} 天</span>
        <span>💰 预算：¥{{ plan.budget }}（{{ plan.people }}人）</span>
        <span>🎯 偏好：{{ plan.preferences.join('、') }}</span>
      </div>

      <!-- 展开/收起按钮 -->
      <button class="toggle-btn" @click="isExpanded = !isExpanded">
        {{ isExpanded ? '▲ 收起详情' : '▼ 展开行程详情' }}
      </button>
    </div>

    <!-- 可折叠区域 -->
    <div v-show="isExpanded" class="expanded-section">
      <!-- 视图切换按钮 -->
      <div class="view-toggle">
        <button
          :class="{ active: viewMode === 'plan' }"
          @click="viewMode = 'plan'"
        >
          📝 书面计划
        </button>
        <button
          :class="{ active: viewMode === 'map' }"
          @click="viewMode = 'map'"
        >
          🗺️ 地图视图
        </button>
      </div>

      <!-- 天数筛选器（仅在计划模式下显示） -->
      <div v-if="viewMode === 'plan'" class="filter-section">
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

      <!-- 书面计划内容 -->
      <div v-if="viewMode === 'plan'" class="days-container">
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
                <div class="title-type-row">
                  <h4>{{ activity.title }}</h4>
                  <span class="type-badge">{{ activity.type }}</span>
                </div>

                <div v-if="activity.location" class="location-wrapper">
                  <p class="location">📍 {{ activity.location }}</p>
                </div>

                <p v-if="activity.fromLocation && activity.toLocation" class="route">
                  🚶 从 {{ activity.fromLocation }} → {{ activity.toLocation }}
                </p>
                <p v-if="activity.transport" class="transport">🚇 {{ activity.transport }}</p>
                <p v-if="activity.durationMinutes !== null" class="duration">
                  ⏱️ 耗时：{{ activity.durationMinutes }} 分钟
                </p>
                <p v-if="activity.desc" class="desc">{{ activity.desc }}</p>
                <p class="price">💰 ¥{{ activity.price }}</p>
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

      <!-- 地图视图 -->
      <div v-if="viewMode === 'map'" class="map-container">
        <TripMap :plan="plan" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { TravelPlanVo } from '../types/travelPlan'
import TripMap from './TripMap.vue' // ←← 确保路径正确！


const props = defineProps<{
  plan: TravelPlanVo
}>()

const isExpanded = ref(false)
const viewMode = ref<'plan' | 'map'>('plan') // 默认显示计划
const selectedDay = ref<number | ''>('')
const coordinatesMap = ref<Record<string, string>>({})

const formatDate = (dateStr: string | null): string => {
  if (!dateStr || dateStr === 'null') return '未指定'
  return dateStr
}

const filteredDays = computed(() => {
  if (selectedDay.value === '') {
    return props.plan.days
  }
  return props.plan.days.filter(day => day.day === selectedDay.value)
})

</script>

<style scoped>
.trip-plan-card {
  max-width: 600px;
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

.summary-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 6px 12px;
  margin-bottom: 12px;
  color: #555;
  font-size: 14px;
}

.summary-grid span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.toggle-btn {
  background: #f0f7ff;
  border: none;
  color: #1a73e8;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}

.toggle-btn:hover {
  background: #e0f0ff;
}

/* —————— 新增：视图切换栏 —————— */
.view-toggle {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.view-toggle button {
  flex: 1;
  padding: 8px;
  border: 1px solid #ddd;
  background: #fafafa;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.view-toggle button.active {
  background: #1a73e8;
  color: white;
  border-color: #1a73e8;
}

/* 折叠区域 */
.expanded-section {
  margin-top: 16px;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 筛选器 */
.filter-section {
  margin: 16px 0;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
}

.filter-section select {
  padding: 10px 0px;
  border: 1px solid #ccc;
  border-radius: 6px;
}

/* 地图容器 */
.map-container {
  width: 100%;
  height: 400px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
}

/* 以下样式保持不变 */
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

.content {
  flex: 1;
}

.title-type-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
}

.title-type-row h4 {
  margin: 0;
  color: #222;
  flex: 1;
}

.location-wrapper {
  margin: 4px 0;
}

.location {
  margin: 2px 0;
  font-size: 0.95em;
  color: #444;
}

.coordinates {
  font-size: 0.85em;
  color: #888;
  margin: 0;
}

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
  padding: 2px 8px;
  background: #e8f0fe;
  color: #1a73e8;
  border-radius: 12px;
  font-size: 0.85em;
  white-space: nowrap;
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