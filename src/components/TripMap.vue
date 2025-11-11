<template>
  <div class="trip-map-container">
    <!-- 地图控制面板 -->
    <div class="map-controls">
      <div class="control-group">
        <label>天数筛选：</label>
        <el-select 
          v-model="selectedDay" 
          placeholder="选择天数" 
          size="small"
          @change="onDayFilterChange"
        >
          <el-option label="全部" value="" />
          <el-option 
            v-for="day in effectivePlan.days" 
            :key="day.day" 
            :label="`第${day.day}天`" 
            :value="day.day" 
          />
        </el-select>
      </div>
      
      <div class="control-group">
        <el-button 
          size="small" 
          @click="fitViewToRoute"
        >
          <el-icon><FullScreen /></el-icon>
          适应视图
        </el-button>
        <el-button 
          size="small" 
          @click="clearAll"
        >
          <el-icon><Delete /></el-icon>
          清除
        </el-button>
      </div>
    </div>

    <!-- 地图容器 -->
    <div id="trip-map" class="map-wrapper"></div>

    <!-- 地点列表面板 -->
    <div class="locations-panel">
      <div class="panel-header">
        <h3><el-icon><Location /></el-icon> 行程地点</h3>
        <span class="location-count">共 {{ allLocations.length }} 个地点</span>
      </div>
      
      <div class="locations-list">
        <div 
          v-for="location in filteredLocations" 
          :key="`${location.day}-${location.index}`"
          :class="['location-item', { active: currentLocation?.id === location.id }]"
          @click="focusOnLocation(location)"
        >
          <div class="location-marker" :style="{ backgroundColor: location.color }">
            {{ location.day }}
          </div>
          <div class="location-info">
            <div class="location-title">
              {{ location.title }}
              <span class="day-tag">第{{ location.day }}天</span>
            </div>
            <div class="location-address">{{ location.address }}</div>
            <div class="location-time">{{ location.time }}</div>
          </div>
          <div class="location-actions">
            <el-button 
              size="mini" 
              circle 
              @click.stop="focusOnLocation(location, true)"
              title="定位到此处"
            >
              <el-icon><Aim /></el-icon>
            </el-button>
          </div>
        </div>
        
        <div v-if="filteredLocations.length === 0" class="no-locations">
          <el-icon><MapLocation /></el-icon>
          <p>暂无地点数据</p>
        </div>
      </div>
    </div>

    <!-- 路线信息面板 -->
    <div v-if="currentRouteInfo" class="route-info-panel">
      <h4>路线信息</h4>
      <div class="route-details">
        <p><strong>起点：</strong>{{ currentRouteInfo.start }}</p>
        <p><strong>终点：</strong>{{ currentRouteInfo.end }}</p>
        <p><strong>距离：</strong>{{ currentRouteInfo.distance }}</p>
        <p><strong>时间：</strong>{{ currentRouteInfo.duration }}</p>
        <p><strong>交通方式：</strong>{{ currentRouteInfo.transport }}</p>
        <p v-if="currentRouteInfo.cost"><strong>花费：</strong>¥{{ currentRouteInfo.cost }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick, computed } from 'vue'
import { ElMessage } from 'element-plus'
import {
  FullScreen,
  Delete,
  Location,
  Aim,
  MapLocation
} from '@element-plus/icons-vue'
import type { TravelPlanVo, Activity } from '../types/travelPlan'

// 高德地图配置
const GAODE_KEY = '7a9824f0e428a15cb02a3700f5836063'

// ========== 测试数据：北京2日游 ==========
const mockPlan: TravelPlanVo = {
  destination: '北京',
  duration: 2,
  budget: 2000,
  people: 2,
  preferences: ['历史文化', '美食'],
  departureDate: '2025-11-15',
  travelTips: ['早晚温差大，注意保暖', '故宫需提前预约'],
  days: [
    {
      day: 1,
      date: '2025-11-15',
      weatherSummary: '晴，10°C~18°C',
      activities: [
        {
          time: '09:00',
          title: '天安门广场',
          location: '北京市东城区天安门广场',
          desc: '观看升旗仪式（如适用）',
          type: '景点',
          fromLocation: '',
          toLocation: '故宫',
          transport: '步行',
          durationMinutes: 60,
          price: 0
        },
        {
          time: '10:30',
          title: '故宫博物院',
          location: '北京市东城区景山前街4号',
          desc: '参观紫禁城',
          type: '景点',
          fromLocation: '天安门',
          toLocation: '王府井',
          transport: '步行',
          durationMinutes: 180,
          price: 60
        },
        {
          time: '14:00',
          title: '王府井步行街',
          location: '北京市东城区王府井大街',
          desc: '午餐与购物',
          type: '餐饮',
          fromLocation: '故宫',
          toLocation: '酒店',
          transport: '步行',
          durationMinutes: 120,
          price: 150
        }
      ]
    },
    {
      day: 2,
      date: '2025-11-16',
      weatherSummary: '多云，8°C~16°C',
      activities: [
        {
          time: '09:00',
          title: '颐和园',
          location: '北京市海淀区新建宫门路19号',
          desc: '游览皇家园林',
          type: '景点',
          fromLocation: '酒店',
          toLocation: '圆明园',
          transport: '公交',
          durationMinutes: 240,
          price: 30
        },
        {
          time: '14:00',
          title: '圆明园遗址公园',
          location: '北京市海淀区清华西路28号',
          desc: '参观历史遗址',
          type: '景点',
          fromLocation: '颐和园',
          toLocation: '酒店',
          transport: '公交',
          durationMinutes: 180,
          price: 25
        }
      ]
    }
  ]
}

// 使用测试数据
const props = defineProps<{
  plan?: TravelPlanVo
}>()

const effectivePlan = ref<TravelPlanVo>(mockPlan)

// 响应式数据
const selectedDay = ref<number | ''>('')
const map = ref<any>(null)
const markers = ref<any[]>([])
const polylines = ref<any[]>([])
const currentRouteInfo = ref<any>(null)
const currentLocation = ref<any>(null)

// 不同天数的颜色配置
const dayColors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
  '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D7BDE2'
]

// 计算所有地点
const allLocations = computed(() => {
  const locations: any[] = []
  effectivePlan.value.days.forEach(day => {
    day.activities.forEach((activity, index) => {
      if (activity.location?.trim()) {
        locations.push({
          id: `${day.day}-${index}`,
          day: day.day,
          index,
          title: activity.title,
          address: activity.location,
          time: activity.time,
          type: activity.type,
          color: dayColors[(day.day - 1) % dayColors.length],
          coordinates: null as [number, number] | null
        })
      }
    })
  })
  return locations
})

// 计算筛选后的地点
const filteredLocations = computed(() => {
  if (!selectedDay.value) {
    return allLocations.value
  }
  return allLocations.value.filter(loc => loc.day === selectedDay.value)
})

// 初始化地图
const initMap = () => {
  return new Promise<boolean>((resolve) => {
    if ((window as any).AMap) {
      createMapInstance()
      resolve(true)
      return
    }

    const script = document.createElement('script')
    script.src = `https://webapi.amap.com/maps?v=2.0&key=${GAODE_KEY}`
    script.onload = () => {
      createMapInstance()
      resolve(true)
    }
    script.onerror = () => {
      ElMessage.error('地图加载失败，请检查网络连接')
      resolve(false)
    }
    document.head.appendChild(script)
  })
}

// 创建地图实例
const createMapInstance = () => {
  const AMap = (window as any).AMap

  AMap.plugin([
    'AMap.Geocoder',
    'AMap.Driving',
    'AMap.Walking',
    'AMap.Transfer',
    'AMap.Scale',
    'AMap.ToolBar',
    'AMap.HawkEye'
  ], () => {
    map.value = new AMap.Map('trip-map', {
      zoom: 12,
      center: [116.397428, 39.90923],
      viewMode: '3D',
      mapStyle: 'amap://styles/light'
    })

    map.value.addControl(new AMap.Scale())
    map.value.addControl(new AMap.ToolBar())
    map.value.addControl(new AMap.HawkEye())

    console.log('✅ 高德地图及插件加载完成')
  })
}

// 地理编码
const geocode = async (address: string): Promise<[number, number] | null> => {
  return new Promise((resolve) => {
    const AMap = (window as any).AMap
    const geocoder = new AMap.Geocoder({ city: '全国' })
    geocoder.getLocation(address, (status: string, result: any) => {
      if (status === 'complete' && result.geocodes.length > 0) {
        const loc = result.geocodes[0].location
        resolve([loc.lng, loc.lat])
      } else {
        console.warn('地理编码失败:', address)
        resolve(null)
      }
    })
  })
}

// 批量获取坐标并更新地点数据
const getCoordinatesForPlan = async () => {
  const coordinatesMap = new Map<string, [number, number]>()
  console.log('📍 开始地理编码所有活动地点...')

  // 更新所有地点的坐标
  for (const location of allLocations.value) {
    const loc = location.address.trim()
    if (loc && !coordinatesMap.has(loc)) {
      console.log(`  🔍 编码: "${loc}"`)
      const coords = await geocode(loc)
      if (coords) {
        coordinatesMap.set(loc, coords)
        // 更新地点的坐标信息
        const locIndex = allLocations.value.findIndex(l => l.id === location.id)
        if (locIndex !== -1) {
          allLocations.value[locIndex].coordinates = coords
        }
        console.log(`  ✅ 成功: ${loc} => [${coords[0].toFixed(6)}, ${coords[1].toFixed(6)}]`)
      } else {
        console.warn(`  ❌ 失败: "${loc}"`)
      }
    }
  }

  console.log(`✅ 地理编码完成，共获取 ${coordinatesMap.size} 个有效坐标`)
  return coordinatesMap
}

// 绘制所有标记点
const drawAllMarkers = async () => {
  if (!map.value) return

  clearOverlays()
  const coordinatesMap = await getCoordinatesForPlan()
  const AMap = (window as any).AMap

  // 绘制所有地点的标记
  allLocations.value.forEach(location => {
    if (selectedDay.value && location.day !== selectedDay.value) return
    
    const coords = coordinatesMap.get(location.address)
    if (coords) {
      addMarker(coords, location, location.color)
    }
  })

  // 绘制路线
  await drawRoutes(coordinatesMap)

  // 设置初始视图
  if (allLocations.value.length > 0 && coordinatesMap.size > 0) {
    fitViewToAllMarkers()
  }
}

// 添加标记点
const addMarker = (coords: [number, number], location: any, color: string) => {
  const AMap = (window as any).AMap
  
  const marker = new AMap.Marker({
    position: coords,
    content: `
      <div class="custom-marker" style="background-color:${color};">
        ${location.day}
      </div>
    `,
    offset: new AMap.Pixel(-12, -12),
    title: location.title
  })

  // 点击标记点事件
  marker.on('click', () => {
    focusOnLocation(location, true)
  })

  map.value.add(marker)
  markers.value.push(marker)
}

// 绘制路线
const drawRoutes = async (coordinatesMap: Map<string, [number, number]>) => {
  const AMap = (window as any).AMap

  // 按天绘制路线
  for (let i = 0; i < effectivePlan.value.days.length; i++) {
    const day = effectivePlan.value.days[i]
    if (selectedDay.value && day.day !== selectedDay.value) continue

    const dayColor = dayColors[i % dayColors.length]
    const dayActivities = day.activities.filter(act => act.location?.trim())

    if (dayActivities.length <= 1) continue

    // 多点连线
    for (let j = 0; j < dayActivities.length - 1; j++) {
      const current = dayActivities[j]
      const next = dayActivities[j + 1]
      const startCoords = coordinatesMap.get(current.location!)
      const endCoords = coordinatesMap.get(next.location!)

      if (startCoords && endCoords) {
        await drawRouteBetweenPoints(
          startCoords,
          endCoords,
          dayColor,
          current,
          next,
          day.day
        )
      }
    }
  }
}

// 绘制两点间的路线
const drawRouteBetweenPoints = (
  start: [number, number], 
  end: [number, number], 
  color: string,
  startAct: Activity,
  endAct: Activity,
  day: number
) => {
  return new Promise<void>((resolve) => {
    const AMap = (window as any).AMap
    const trans = (startAct.transport || '').toLowerCase()

    let plugin: any
    if (trans.includes('公交') || trans.includes('地铁') || trans.includes('换乘')) {
      plugin = new AMap.Transfer()
    } else if (trans.includes('步行') || trans.includes('走路')) {
      plugin = new AMap.Walking()
    } else {
      plugin = new AMap.Walking()
    }

    plugin.search(start, end, (status: string, result: any) => {
      if (status === 'complete' && result.routes?.[0]) {
        const path = result.routes[0].steps.flatMap((s: any) => s.path || [])
        if (path.length > 0) {
          const polyline = new AMap.Polyline({
            path,
            strokeColor: color,
            strokeWeight: 6,
            strokeOpacity: 0.8
          })

          const info = extractRouteInfo(result, startAct, endAct)
          polyline.routeInfo = info
          polyline.on('click', () => {
            currentRouteInfo.value = {
              ...info,
              start: startAct.location,
              end: endAct.location
            }
          })

          map.value.add(polyline)
          polylines.value.push(polyline)
        }
      }
      resolve()
    })
  })
}

// 聚焦到指定地点
const focusOnLocation = (location: any, zoom: boolean = false) => {
  currentLocation.value = location
  
  // 查找地点的坐标
  const coords = allLocations.value.find(l => l.id === location.id)?.coordinates
  if (coords && map.value) {
    map.value.setCenter(coords)
    if (zoom) {
      map.value.setZoom(16)
    }
    
    // 高亮对应的标记点
    markers.value.forEach(marker => {
      const markerPos = marker.getPosition()
      if (markerPos && markerPos.lng === coords[0] && markerPos.lat === coords[1]) {
        marker.setAnimation('AMAP_ANIMATION_BOUNCE')
        setTimeout(() => {
          marker.setAnimation(null)
        }, 1000)
      }
    })
  }
}

// 适应所有标记点的视图
const fitViewToAllMarkers = () => {
  if (!map.value || markers.value.length === 0) return
  
  const bounds = new (window as any).AMap.Bounds()
  markers.value.forEach(marker => {
    bounds.extend(marker.getPosition())
  })
  
  map.value.setBounds(bounds)
}

// 提取路线信息
const extractRouteInfo = (result: any, startAct: Activity, endAct: Activity) => {
  const route = result.routes[0]
  if (!route) return null

  return {
    distance: formatDistance(route.distance),
    duration: formatDuration(route.time),
    transport: startAct.transport || '步行',
    cost: calculateCost(route.distance, startAct.transport)
  }
}

const formatDistance = (meters: number) => meters < 1000 ? `${Math.round(meters)}米` : `${(meters / 1000).toFixed(1)}公里`
const formatDuration = (seconds: number) => {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  return h > 0 ? `${h}小时${m}分钟` : `${m}分钟`
}

const calculateCost = (distance: number, transport?: string) => {
  const t = (transport || '').toLowerCase()
  if (t.includes('步行')) return 0
  if (t.includes('公交') || t.includes('地铁')) return Math.max(2, Math.ceil(distance / 10000) * 3)
  if (t.includes('打车')) return Math.max(8, Math.ceil(distance / 1000) * 2)
  return 0
}

const fitViewToRoute = () => {
  if (markers.value.length > 0) {
    fitViewToAllMarkers()
  } else if (polylines.value.length > 0) {
    const allPaths = polylines.value.flatMap(p => p.getPath())
    if (allPaths.length > 0) map.value.setFitView()
  }
}

const clearOverlays = () => {
  if (!map.value) return
  markers.value.forEach(m => map.value.remove(m))
  polylines.value.forEach(p => map.value.remove(p))
  markers.value = []
  polylines.value = []
  currentRouteInfo.value = null
  currentLocation.value = null
}

const clearAll = () => {
  clearOverlays()
  selectedDay.value = ''
}

const onDayFilterChange = () => {
  drawAllMarkers()
}

watch(() => props.plan, () => {
  if (props.plan) effectivePlan.value = props.plan
  if (map.value) drawAllMarkers()
}, { deep: true })

onMounted(async () => {
  const success = await initMap()
  if (success) {
    await nextTick()
    drawAllMarkers()
  }
})

onUnmounted(() => {
  if (map.value) map.value.destroy()
})
</script>

<style scoped>
.trip-map-container {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

.map-controls {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 1000;
  background: white;
  padding: 10px;
  border-radius: 6px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  gap: 20px;
  align-items: center;
  width: 25em;
}

.control-group {
  display: flex;
  align-items: center;
  gap: 20px;
}

.control-group label {
  font-size: 14px;
  color: #666;
  white-space: nowrap;
}

.map-wrapper {
  width: 100%;
  flex: 1;
  min-height: 300px;
}

.locations-panel {
  background: white;
  border-top: 1px solid #e8e8e8;
  flex: 0 0 auto;
  max-height: 40vh;
  min-height: 150px;
  display: flex;
  flex-direction: column;
}

.panel-header {
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fafafa;
  flex-shrink: 0;
}

.panel-header h3 {
  margin: 0;
  font-size: 16px;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
}

.location-count {
  font-size: 12px;
  color: #666;
  background: #e8f4fd;
  padding: 2px 8px;
  border-radius: 10px;
}

.locations-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.location-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
  flex-shrink: 0;
}

.location-item:hover {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
}

.location-item.active {
  border-color: #409eff;
  background: #f0f7ff;
}

.location-marker {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 12px;
  margin-right: 12px;
  flex-shrink: 0;
}

.location-info {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.location-title {
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.day-tag {
  font-size: 12px;
  color: #666;
  background: #f0f0f0;
  padding: 2px 6px;
  border-radius: 4px;
  flex-shrink: 0;
}

.location-address {
  font-size: 12px;
  color: #666;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.location-time {
  font-size: 11px;
  color: #999;
}

.location-actions {
  flex-shrink: 0;
  margin-left: 8px;
}

.no-locations {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #999;
  font-style: italic;
  flex: 1;
}

.no-locations .el-icon {
  font-size: 48px;
  margin-bottom: 12px;
  opacity: 0.5;
}

.no-locations p {
  margin: 0;
  font-size: 14px;
}

.route-info-panel {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 1000;
  background: white;
  padding: 15px;
  border-radius: 6px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  max-width: 300px;
  min-width: 250px;
}

.route-info-panel h4 {
  margin: 0 0 10px 0;
  color: #333;
  border-bottom: 1px solid #eee;
  padding-bottom: 5px;
}

.route-details p {
  margin: 5px 0;
  font-size: 14px;
  line-height: 1.4;
}

.route-details strong {
  color: #666;
}

:deep(.custom-marker) {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: white;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  font-weight: bold;
}

@media (max-width: 768px) {
  .trip-map-container { 
    height: 100vh; 
  }
  
  .map-controls { 
    flex-direction: column; 
    gap: 8px; 
    padding: 8px; 
    width: auto;
  }
  
  .locations-panel {
    max-height: 30vh;
  }
  
  .route-info-panel { 
    position: relative; 
    top: auto; 
    right: auto; 
    margin: 10px; 
  }
  
  .location-title {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
}
</style>