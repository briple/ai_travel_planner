<!-- src/App.vue -->
<template>
  <div class="app-container">
    <!-- 路由出口：当前匹配的页面组件会在这里渲染 -->
    <router-view />
      <!-- <TripPlanCard :plan="mockPlan" /> -->
  </div>
</template>

<script setup lang="ts">
import TripPlanCard from './components/TripPlanCard.vue'
import type { TravelPlanVo } from './types/travelPlan'

const mockPlan: TravelPlanVo = {
  destination: "东京",
  duration: 3,
  budget: 15000,
  people: 2,
  preferences: ["美食", "文化", "购物"],
  departureDate: "2025-12-01",
  travelTips: [
    "日本电压为100V，插座为A型，建议携带转换插头。",
    "大部分景点支持支付宝，但小额现金仍需准备。",
    "推荐下载Google Maps和Japan Travel by NAVITIME应用。"
  ],
  days: [
    {
      day: 1,
      date: "2025-12-01",
      weatherSummary: "晴，18°C",
      activities: [
        {
          time: "08:30",
          title: "酒店早餐",
          location: "东京新宿华盛顿酒店",
          desc: "自助早餐，含日式与西式选项",
          type: "餐饮",
          fromLocation: "",
          toLocation: "",
          transport: "",
          durationMinutes: null,
          price: 80
        },
        {
          time: "09:30",
          title: "前往浅草寺",
          fromLocation: "东京新宿华盛顿酒店",
          toLocation: "浅草寺",
          transport: "地铁丸之内线转银座线",
          desc: "乘坐地铁前往浅草寺",
          type: "交通",
          location: "",
          durationMinutes: 35,
          price: 22
        },
        {
          time: "10:15",
          title: "浅草寺参观",
          location: "日本东京都台东区浅草2-3-1",
          desc: "参观雷门、仲见世商店街和本堂",
          type: "景点",
          fromLocation: "",
          toLocation: "",
          transport: "",
          durationMinutes: null,
          price: 0
        }
      ]
    },
    {
      day: 2,
      date: "2025-12-02",
      weatherSummary: "多云，20°C",
      activities: [
        {
          time: "09:00",
          title: "筑地市场早餐",
          location: "筑地市场",
          desc: "品尝新鲜寿司和海鲜丼",
          type: "餐饮",
          fromLocation: "",
          toLocation: "",
          transport: "",
          durationMinutes: null,
          price: 120
        }
      ]
    }
  ]
}
</script>

<style scoped>
/* 确保容器占据整个视口 */
.app-container {
  min-height: 100vh;
  width: 100vw;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  margin: 0;
  padding: 0;
  overflow: hidden;
}
</style>

<!-- 全局样式可放在 index.css 或这里使用非 scoped style -->
<style>
html, body, #app {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}
</style>