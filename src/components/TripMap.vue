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
          @click="fitViewToAllMarkers"
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
        <el-button 
          size="small" 
          @click="toggleDragMode"
          :type="enableDrag ? 'primary' : ''"
        >
          <el-icon><Pointer /></el-icon>
          {{ enableDrag ? '禁用' : '启用' }}拖拽调整
        </el-button>
      </div>
    </div>

    <!-- 地图容器 -->
    <div id="trip-map" class="map-wrapper"></div>

    <!-- 地点列表面板 -->
    <div class="locations-panel">
      <div class="panel-header">
        <h3><el-icon><Location /></el-icon> 行程地点</h3>
        <span class="location-count">共 {{ validLocations.length }} 个地点</span>
      </div>
      
      <div class="locations-list">
        <div 
          v-for="location in filteredLocations" 
          :key="location.id"
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
              <span class="type-tag">{{ getTypeText(location.type) }}</span>
              <span v-if="location.isStart" class="start-tag">起点</span>
              <span v-if="location.isEnd" class="end-tag">终点</span>
            </div>
            <div class="location-address">{{ location.address }}</div>
            <div class="location-time">{{ location.time }}</div>
          </div>
          <div class="location-actions">
            <el-button 
              size="small" 
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
        <p v-if="enableDrag" class="drag-tip">
          <el-icon><InfoFilled /></el-icon>
          可拖拽路线上的点调整路径
        </p>
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
  MapLocation,
  Pointer,
  InfoFilled
} from '@element-plus/icons-vue'
import type { TravelPlanVo, Activity } from '../types/travelPlan'

// 高德地图配置
const GAODE_KEY = '7a9824f0e428a15cb02a3700f5836063'

// 使用测试数据
const props = defineProps<{
  plan : TravelPlanVo
}>()

const effectivePlan = ref<TravelPlanVo>(props.plan)

// 响应式数据
const selectedDay = ref<number | ''>('')
const map = ref<any>(null)
const markers = ref<any[]>([])
const dragRoutes = ref<any[]>([]) // 存储DragRoute实例
const currentRouteInfo = ref<any>(null)
const currentLocation = ref<any>(null)
const enableDrag = ref(false) // 拖拽模式开关

// 不同天数的颜色配置
const dayColors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
  '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D7BDE2'
]

// 活动类型图标映射
const activityIcons = {
  '餐饮': '🍽️',
  '景点': '🏛️',
  '住宿': '🏨',
  '交通': '🚗',
  '购物': '🛍️',
  '体验': '🎯'
}

// 计算所有有效地点（有经纬度的非交通活动）
const validLocations = computed(() => {
  const locations: any[] = []
  effectivePlan.value.days.forEach(day => {
    const dayActivities = day.activities.filter(activity => 
      activity.latitude && activity.longitude && activity.type !== '交通'
    )
    
    // 标记起点和终点
    dayActivities.forEach((activity, index) => {
      const isStart = index === 0
      const isEnd = index === dayActivities.length - 1
      
      locations.push({
        id: `${day.day}-${index}`,
        day: day.day,
        index,
        title: activity.title,
        address: activity.location,
        time: activity.time,
        type: activity.type,
        latitude: activity.latitude,
        longitude: activity.longitude,
        color: dayColors[(day.day - 1) % dayColors.length],
        icon: activityIcons[activity.type as keyof typeof activityIcons] || '📍',
        isStart,
        isEnd
      })
    })
  })
  return locations
})

// 计算筛选后的地点
const filteredLocations = computed(() => {
  if (!selectedDay.value) {
    return validLocations.value
  }
  return validLocations.value.filter(loc => loc.day === selectedDay.value)
})

// 获取第一个有效地点的坐标作为初始中心
const getInitialCenter = () => {
  if (validLocations.value.length > 0) {
    const firstLocation = validLocations.value[0]
    return [firstLocation.longitude, firstLocation.latitude]
  }
  // 默认北京中心
  return [116.397428, 39.90923]
}

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
      // 加载AMapUI
      loadAMapUI().then(() => {
        createMapInstance()
        resolve(true)
      }).catch(() => {
        ElMessage.error('AMapUI加载失败')
        resolve(false)
      })
    }
    script.onerror = () => {
      ElMessage.error('地图加载失败，请检查网络连接')
      resolve(false)
    }
    document.head.appendChild(script)
  })
}

// 加载AMapUI
const loadAMapUI = () => {
  return new Promise((resolve, reject) => {
    if ((window as any).AMapUI) {
      resolve(true)
      return
    }

    const script = document.createElement('script')
    script.src = 'https://webapi.amap.com/ui/1.1/main.js'
    script.onload = () => {
      // 等待AMapUI初始化
      const checkAMapUI = () => {
        if ((window as any).AMapUI) {
          resolve(true)
        } else {
          setTimeout(checkAMapUI, 100)
        }
      }
      checkAMapUI()
    }
    script.onerror = () => {
      reject(new Error('AMapUI加载失败'))
    }
    document.head.appendChild(script)
  })
}

// 创建地图实例
const createMapInstance = () => {
  const AMap = (window as any).AMap
  const AMapUI = (window as any).AMapUI

  AMap.plugin([
    'AMap.Geocoder',
    'AMap.Driving',
    'AMap.Walking',
    'AMap.Transfer',
    'AMap.Scale',
    'AMap.ToolBar',
    'AMap.HawkEye',
    'AMap.InfoWindow'
  ], () => {
    const initialCenter = getInitialCenter()
    
    map.value = new AMap.Map('trip-map', {
      zoom: 12,
      center: initialCenter,
      viewMode: '3D',
      mapStyle: 'amap://styles/light'
    })

    map.value.addControl(new AMap.Scale())
    map.value.addControl(new AMap.ToolBar())
    map.value.addControl(new AMap.HawkEye())

    console.log('✅ 高德地图及插件加载完成，初始中心:', initialCenter)
  })
}

// 切换拖拽模式
const toggleDragMode = () => {
  enableDrag.value = !enableDrag.value
  if (enableDrag.value) {
    ElMessage.success('已启用拖拽调整模式')
    redrawRoutesWithDrag()
  } else {
    ElMessage.info('已禁用拖拽调整模式')
    redrawRoutes()
  }
}

// 使用DragRoute绘制路线（拖拽模式）
const drawRoutesWithDrag = () => {
  const AMap = (window as any).AMap
  const AMapUI = (window as any).AMapUI

  if (!AMapUI) {
    ElMessage.warning('AMapUI未加载，无法使用拖拽功能')
    return
  }

  // 清除之前的路线
  clearDragRoutes()

  // 按天绘制路线
  for (let i = 0; i < effectivePlan.value.days.length; i++) {
    const day = effectivePlan.value.days[i]
    if (selectedDay.value && day.day !== selectedDay.value) continue

    const dayColor = dayColors[i % dayColors.length]
    const dayValidLocations = validLocations.value.filter(loc => loc.day === day.day)

    console.log(`📅 第${day.day}天有效地点:`, dayValidLocations.length)

    if (dayValidLocations.length <= 1) {
      console.log(`⚠️ 第${day.day}天地点数量不足，跳过路线绘制`)
      continue
    }

    // 按时间顺序排序
    const sortedLocations = [...dayValidLocations].sort((a, b) => {
      return a.time.localeCompare(b.time)
    })

    console.log(`🔄 第${day.day}天排序后地点:`, sortedLocations.map(l => `${l.title} (${l.time})`))

    // 创建路径点数组
    const path = sortedLocations.map(location => [location.longitude, location.latitude])

    // 查找对应的交通活动信息
    const transportActivity = findTransportActivity(day.day, 0, sortedLocations.length - 1)
    const transportType = transportActivity?.transport || '驾车'

    // 使用DragRoute规划路线
    createDragRoute(path, transportType, dayColor, sortedLocations, day.day)
  }
}

// 创建DragRoute实例
const createDragRoute = (path: any[], transportType: string, color: string, locations: any[], day: number) => {
  const AMap = (window as any).AMap
  const AMapUI = (window as any).AMapUI

  if (!AMapUI) return

  // 根据交通方式选择策略
  let policy
  const transport = transportType.toLowerCase()
  
  if (transport.includes('地铁') || transport.includes('公交') || transport.includes('巴士') || transport.includes('换乘')) {
    policy = AMap.TransferPolicy.LEAST_TIME
  } else if (transport.includes('步行') || transport.includes('走路')) {
    // DragRoute主要支持驾车，步行使用其他方式
    drawWalkingRoute(path, color, locations, day)
    return
  } else if (transport.includes('骑行') || transport.includes('自行车')) {
    // DragRoute主要支持驾车，骑行使用其他方式
    drawRidingRoute(path, color, locations, day)
    return
  } else {
    // 默认使用驾车
    policy = AMap.DrivingPolicy.LEAST_FEE
  }

  try {
    // 创建DragRoute实例
    const dragRoute = new AMapUI.DragRoute(map.value, path, policy, {
      startMarkerOptions: {
        // 自定义起点标记
        content: createRouteMarkerContent(locations[0], 'start'),
        offset: new AMap.Pixel(-15, -30)
      },
      endMarkerOptions: {
        // 自定义终点标记
        content: createRouteMarkerContent(locations[locations.length - 1], 'end'),
        offset: new AMap.Pixel(-15, -30)
      },
      midMarkerOptions: {
        // 自定义中间点标记
        content: createRouteMarkerContent(null, 'mid'),
        offset: new AMap.Pixel(-8, -8)
      },
      routeLineOptions: {
        // 路线样式
        strokeColor: color,
        strokeWeight: 6,
        strokeOpacity: 0.8
      }
    })

    // 监听路线规划完成
    dragRoute.on('complete', (result: any) => {
      console.log(`✅ DragRoute路线规划完成: ${locations[0].title} → ${locations[locations.length - 1].title}`, result)
      
      // 提取路线信息
      const route = result.routes && result.routes[0]
      if (route) {
        const info = extractRouteInfo(route, transportType, locations[0], locations[locations.length - 1])
        
        // 点击路线显示信息
        dragRoute.routeLine.on('click', () => {
          currentRouteInfo.value = {
            ...info,
            start: locations[0].address,
            end: locations[locations.length - 1].address
          }
        })
      }
    })

    // 监听路线规划错误
    dragRoute.on('error', (error: any) => {
      console.warn(`❌ DragRoute路线规划失败:`, error)
      // 规划失败时绘制直线
      drawDirectLine([path[0], path[path.length - 1]], color, locations[0], locations[locations.length - 1], transportType)
    })

    // 开始路线规划
    dragRoute.search()
    
    // 存储DragRoute实例
    dragRoutes.value.push(dragRoute)

  } catch (error) {
    console.error('创建DragRoute失败:', error)
    // 失败时使用备用方案
    drawDirectLine([path[0], path[path.length - 1]], color, locations[0], locations[locations.length - 1], transportType)
  }
}

// 创建路线标记内容
const createRouteMarkerContent = (location: any | null, type: 'start' | 'end' | 'mid') => {
  if (type === 'start') {
    return `
      <div class="route-marker start-marker" style="background-color:${location?.color || '#52c41a'};" title="${location?.title || '起点'}">
        <div class="marker-content">
          <span class="marker-text">起</span>
        </div>
      </div>
    `
  } else if (type === 'end') {
    return `
      <div class="route-marker end-marker" style="background-color:${location?.color || '#fa541c'};" title="${location?.title || '终点'}">
        <div class="marker-content">
          <span class="marker-text">终</span>
        </div>
      </div>
    `
  } else {
    return `
      <div class="route-marker mid-marker" style="background-color:#409eff;" title="途经点">
        <div class="marker-content">
          <span class="marker-text">经</span>
        </div>
      </div>
    `
  }
}

// 绘制步行路线（备用方案）
const drawWalkingRoute = (path: any[], color: string, locations: any[], day: number) => {
  const AMap = (window as any).AMap
  
  const walking = new AMap.Walking({
    map: map.value
  })

  // 分段绘制步行路线
  for (let i = 0; i < path.length - 1; i++) {
    const start = path[i]
    const end = path[i + 1]
    
    walking.search(start, end, (status: string, result: any) => {
      if (status === 'complete' && result.routes?.[0]) {
        const route = result.routes[0]
        const routePath = route.steps.flatMap((step: any) => step.path || [])
        
        if (routePath.length > 0) {
          const polyline = new AMap.Polyline({
            path: routePath,
            strokeColor: color,
            strokeWeight: 4,
            strokeOpacity: 0.8,
            strokeStyle: 'solid',
            lineJoin: 'round'
          })

          const info = extractRouteInfo(route, '步行', locations[i], locations[i + 1])
          polyline.routeInfo = info
          
          polyline.on('click', () => {
            currentRouteInfo.value = {
              ...info,
              start: locations[i].address,
              end: locations[i + 1].address
            }
          })

          map.value.add(polyline)
        }
      } else {
        // 步行规划失败时绘制直线
        drawDirectLine([start, end], color, locations[i], locations[i + 1], '步行')
      }
    })
  }
}

// 绘制骑行路线（备用方案）
const drawRidingRoute = (path: any[], color: string, locations: any[], day: number) => {
  const AMap = (window as any).AMap
  
  const riding = new AMap.Riding({
    map: map.value
  })

  // 分段绘制骑行路线
  for (let i = 0; i < path.length - 1; i++) {
    const start = path[i]
    const end = path[i + 1]
    
    riding.search(start, end, (status: string, result: any) => {
      if (status === 'complete' && result.routes?.[0]) {
        const route = result.routes[0]
        const routePath = route.steps.flatMap((step: any) => step.path || [])
        
        if (routePath.length > 0) {
          const polyline = new AMap.Polyline({
            path: routePath,
            strokeColor: color,
            strokeWeight: 4,
            strokeOpacity: 0.8,
            strokeStyle: 'solid',
            lineJoin: 'round'
          })

          const info = extractRouteInfo(route, '骑行', locations[i], locations[i + 1])
          polyline.routeInfo = info
          
          polyline.on('click', () => {
            currentRouteInfo.value = {
              ...info,
              start: locations[i].address,
              end: locations[i + 1].address
            }
          })

          map.value.add(polyline)
        }
      } else {
        // 骑行规划失败时绘制直线
        drawDirectLine([start, end], color, locations[i], locations[i + 1], '骑行')
      }
    })
  }
}

// 使用传统方式绘制路线（非拖拽模式）
const drawRoutes = () => {
  const AMap = (window as any).AMap

  // 按天绘制路线
  for (let i = 0; i < effectivePlan.value.days.length; i++) {
    const day = effectivePlan.value.days[i]
    if (selectedDay.value && day.day !== selectedDay.value) continue

    const dayColor = dayColors[i % dayColors.length]
    const dayValidLocations = validLocations.value.filter(loc => loc.day === day.day)

    console.log(`📅 第${day.day}天有效地点:`, dayValidLocations.length)

    if (dayValidLocations.length <= 1) {
      console.log(`⚠️ 第${day.day}天地点数量不足，跳过路线绘制`)
      continue
    }

    // 按时间顺序排序
    const sortedLocations = [...dayValidLocations].sort((a, b) => {
      return a.time.localeCompare(b.time)
    })

    // 多点连线
    for (let j = 0; j < sortedLocations.length - 1; j++) {
      const currentLoc = sortedLocations[j]
      const nextLoc = sortedLocations[j + 1]
      
      // 查找对应的交通活动信息
      const transportActivity = findTransportActivity(day.day, currentLoc.index, nextLoc.index)
      const transportType = transportActivity?.transport || '步行'
      
      // 使用高德地图API规划路线
      planRouteWithAMap(
        [currentLoc.longitude, currentLoc.latitude],
        [nextLoc.longitude, nextLoc.latitude],
        transportType,
        dayColor,
        currentLoc,
        nextLoc,
        day.day
      )
    }
  }
}

// 重新绘制路线（根据当前模式）
const redrawRoutes = () => {
  if (enableDrag.value) {
    drawRoutesWithDrag()
  } else {
    drawRoutes()
  }
}

// 重新绘制拖拽路线
const redrawRoutesWithDrag = () => {
  drawRoutesWithDrag()
}

// 清除DragRoute实例
const clearDragRoutes = () => {
  dragRoutes.value.forEach(route => {
    try {
      route.destroy()
    } catch (error) {
      console.warn('清除DragRoute失败:', error)
    }
  })
  dragRoutes.value = []
}

// 查找对应的交通活动
const findTransportActivity = (day: number, fromIndex: number, toIndex: number) => {
  const dayData = effectivePlan.value.days.find(d => d.day === day)
  if (!dayData) return null
  
  // 查找在 fromIndex 和 toIndex 之间的交通活动
  for (let i = fromIndex; i < toIndex; i++) {
    const activity = dayData.activities[i]
    if (activity.type === '交通' && activity.transport) {
      return activity
    }
  }
  return null
}

// 使用传统API规划路线（非拖拽模式）
const planRouteWithAMap = (
  start: [number, number], 
  end: [number, number], 
  transportType: string,
  color: string,
  startLoc: any,
  endLoc: any,
  day: number
) => {
  const AMap = (window as any).AMap

  let routePlugin: any
  const transport = transportType.toLowerCase()
  
  // 根据交通工具选择不同的路线规划插件
  if (transport.includes('地铁') || transport.includes('公交') || transport.includes('巴士') || transport.includes('换乘')) {
    routePlugin = new AMap.Transfer({
      policy: AMap.TransferPolicy.LEAST_TIME
    })
  } else if (transport.includes('步行') || transport.includes('走路')) {
    routePlugin = new AMap.Walking()
  } else if (transport.includes('骑行') || transport.includes('自行车')) {
    routePlugin = new AMap.Riding()
  } else {
    // 默认使用驾车
    routePlugin = new AMap.Driving({
      policy: AMap.DrivingPolicy.LEAST_TIME
    })
  }

  routePlugin.search(start, end, (status: string, result: any) => {
    if (status === 'complete' && result.routes?.[0]) {
      const route = result.routes[0]
      const path = route.steps.flatMap((step: any) => step.path || [])
      console.log('lalala', route)
      if (path.length > 0) {
        // 绘制路线
        const polyline = new AMap.Polyline({
          path,
          strokeColor: color,
          strokeWeight: 6,
          strokeOpacity: 0.8,
          strokeStyle: 'solid',
          lineJoin: 'round'
        })

        // 提取路线信息
        const info = extractRouteInfo(route, transportType, startLoc, endLoc)
        polyline.routeInfo = info
        
        // 点击路线显示信息
        polyline.on('click', () => {
          currentRouteInfo.value = {
            ...info,
            start: startLoc.address,
            end: endLoc.address
          }
        })

        map.value.add(polyline)
        console.log(`✅ 绘制${transportType}路线: ${startLoc.title} → ${endLoc.title}`, info)
      }
    } else {
      console.warn(`❌ 路线规划失败: ${startLoc.title} → ${endLoc.title}`, status)
      // 规划失败时绘制直线
      drawDirectLine([start, end], color, startLoc, endLoc, transportType)
    }
  })
}

// 绘制直线（备用方案）
const drawDirectLine = (
  path: [number, number][], 
  color: string,
  startLoc: any,
  endLoc: any,
  transportType: string
) => {
  const AMap = (window as any).AMap

  const distance = calculateDistance(path[0][1], path[0][0], path[1][1], path[1][0])
  
  const polyline = new AMap.Polyline({
    path,
    strokeColor: color,
    strokeWeight: 3,
    strokeOpacity: 0.6,
    strokeStyle: 'dashed',
    lineJoin: 'round'
  })

  const info = {
    distance: formatDistance(distance),
    duration: estimateDuration(distance, transportType),
    transport: `${transportType} (直线)`,
    cost: 0
  }

  polyline.routeInfo = info
  polyline.on('click', () => {
    currentRouteInfo.value = {
      ...info,
      start: startLoc.address,
      end: endLoc.address
    }
  })

  map.value.add(polyline)
  console.log(`⚠️ 绘制备用直线: ${startLoc.title} → ${endLoc.title}`, info)
}

// 计算两点间距离（米）
const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371000
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
          Math.sin(dLng/2) * Math.sin(dLng/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

// 预估行程时间
const estimateDuration = (distance: number, transportType: string): string => {
  let speed = 1.4
  
  if (transportType.includes('地铁') || transportType.includes('公交')) {
    speed = 5
  } else if (transportType.includes('驾车') || transportType.includes('出租车')) {
    speed = 10
  } else if (transportType.includes('骑行')) {
    speed = 4
  }
  
  const seconds = distance / speed
  return formatDuration(seconds)
}

// 提取路线信息
const extractRouteInfo = (route: any, transportType: string, startLoc: any, endLoc: any) => {
  return {
    distance: formatDistance(route.distance),
    duration: formatDuration(route.time),
    transport: transportType,
    cost: calculateCost(route.distance, transportType)
  }
}

// 计算费用
const calculateCost = (distance: number, transportType: string) => {
  const transport = transportType.toLowerCase()
  
  if (transport.includes('步行') || transport.includes('骑行')) {
    return 0
  } else if (transport.includes('公交') || transport.includes('地铁')) {
    return Math.max(2, Math.ceil(distance / 10000) * 3)
  } else if (transport.includes('出租车') || transport.includes('打车')) {
    return Math.max(8, Math.ceil(distance / 1000) * 2.5)
  } else if (transport.includes('驾车')) {
    return Math.ceil(distance / 1000) * 0.8
  }
  return 0
}

// 绘制所有标记点
const drawAllMarkers = () => {
  if (!map.value) return

  clearOverlays()
  console.log('📍 开始绘制标记点，有效地点数量:', validLocations.value.length)

  // 绘制所有有效地点的标记
  validLocations.value.forEach(location => {
    if (selectedDay.value && location.day !== selectedDay.value) return
    
    addMarker(location)
  })

  // 绘制路线
  redrawRoutes()

  // 设置初始视图
  if (validLocations.value.length > 0) {
    fitViewToAllMarkers()
  }
}

// 添加标记点
const addMarker = (location: any) => {
  const AMap = (window as any).AMap
  
  // 根据是否为起点/终点设置不同的标记样式
  let markerContent = ''
  if (location.isStart) {
    markerContent = `
      <div class="custom-marker start-marker" style="background-color:${location.color};" title="${location.title}">
        <div class="marker-content">
          <span class="marker-day">起</span>
          <span class="marker-icon">${location.icon}</span>
        </div>
      </div>
    `
  } else if (location.isEnd) {
    markerContent = `
      <div class="custom-marker end-marker" style="background-color:${location.color};" title="${location.title}">
        <div class="marker-content">
          <span class="marker-day">终</span>
          <span class="marker-icon">${location.icon}</span>
        </div>
      </div>
    `
  } else {
    markerContent = `
      <div class="custom-marker" style="background-color:${location.color};" title="${location.title}">
        <div class="marker-content">
          <span class="marker-day">${location.day}</span>
          <span class="marker-icon">${location.icon}</span>
        </div>
      </div>
    `
  }
  
  const marker = new AMap.Marker({
    position: [location.longitude, location.latitude],
    content: markerContent,
    offset: new AMap.Pixel(-20, -20),
    title: `${location.title} (第${location.day}天)`
  })

  // 添加信息窗口
  const infoWindow = new AMap.InfoWindow({
    content: `
      <div class="location-info-window">
        <h4>${location.title}</h4>
        <p><strong>地址：</strong>${location.address}</p>
        <p><strong>时间：</strong>${location.time}</p>
        <p><strong>类型：</strong>${location.type}</p>
        <p><strong>第${location.day}天</strong></p>
        ${location.isStart ? '<p class="start-badge">🏁 起点</p>' : ''}
        ${location.isEnd ? '<p class="end-badge">🎯 终点</p>' : ''}
      </div>
    `,
    offset: new AMap.Pixel(0, -40)
  })

  // 点击标记点事件
  marker.on('click', () => {
    infoWindow.open(map.value, marker.getPosition())
    focusOnLocation(location, true)
  })

  map.value.add(marker)
  markers.value.push(marker)
  console.log(`📍 添加标记: ${location.title} [${location.longitude}, ${location.latitude}]`)
}

// 聚焦到指定地点
const focusOnLocation = (location: any, zoom: boolean = false) => {
  currentLocation.value = location
  
  if (map.value) {
    map.value.setCenter([location.longitude, location.latitude])
    if (zoom) {
      map.value.setZoom(16)
    }
    
    // 高亮对应的标记点
    markers.value.forEach(marker => {
      const markerPos = marker.getPosition()
      if (markerPos && 
          Math.abs(markerPos.lng - location.longitude) < 0.0001 && 
          Math.abs(markerPos.lat - location.latitude) < 0.0001) {
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
  
  map.value.setBounds(bounds, true, [50, 50, 50, 50])
}

const formatDistance = (meters: number) => meters < 1000 ? `${Math.round(meters)}米` : `${(meters / 1000).toFixed(1)}公里`
const formatDuration = (seconds: number) => {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  return h > 0 ? `${h}小时${m}分钟` : `${m}分钟`
}

const getTypeText = (type: string) => {
  const typeMap: { [key: string]: string } = {
    '餐饮': '餐饮',
    '景点': '景点',
    '住宿': '住宿',
    '交通': '交通',
    '购物': '购物',
    '体验': '体验'
  }
  return typeMap[type] || type
}

const clearOverlays = () => {
  if (!map.value) return
  markers.value.forEach(m => map.value.remove(m))
  clearDragRoutes()
  currentRouteInfo.value = null
  currentLocation.value = null
}

const clearAll = () => {
  clearOverlays()
  selectedDay.value = ''
  enableDrag.value = false
}

const onDayFilterChange = () => {
  drawAllMarkers()
}

watch(() => props.plan, () => {
  if (props.plan) {
    effectivePlan.value = props.plan
    if (map.value) {
      nextTick(() => {
        drawAllMarkers()
      })
    }
  }
}, { deep: true })

onMounted(async () => {
  const success = await initMap()
  if (success) {
    await nextTick()
    drawAllMarkers()
  }
})

onUnmounted(() => {
  if (map.value) {
    clearDragRoutes()
    map.value.destroy()
  }
})
</script>

<style scoped>
.trip-map-container {
  position: relative;
  width: 100%;
  height: 100%;
  min-width: 800px;
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

.type-tag {
  font-size: 12px;
  color: #409eff;
  background: #f0f7ff;
  padding: 2px 6px;
  border-radius: 4px;
  flex-shrink: 0;
}

.start-tag {
  font-size: 12px;
  color: #52c41a;
  background: #f6ffed;
  padding: 2px 6px;
  border-radius: 4px;
  flex-shrink: 0;
  border: 1px solid #b7eb8f;
}

.end-tag {
  font-size: 12px;
  color: #fa541c;
  background: #fff2e8;
  padding: 2px 6px;
  border-radius: 4px;
  flex-shrink: 0;
  border: 1px solid #ffbb96;
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

.drag-tip {
  color: #e6a23c;
  background: #fdf6ec;
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #f5dab1;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 10px;
}

:deep(.custom-marker) {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  border: 3px solid white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

:deep(.start-marker) {
  border-color: #52c41a;
  box-shadow: 0 2px 8px rgba(82, 196, 26, 0.4);
}

:deep(.end-marker) {
  border-color: #fa541c;
  box-shadow: 0 2px 8px rgba(250, 84, 28, 0.4);
}

:deep(.custom-marker:hover) {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
}

:deep(.marker-content) {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

:deep(.marker-day) {
  font-size: 10px;
  line-height: 1;
}

:deep(.marker-icon) {
  font-size: 12px;
  line-height: 1;
}

:deep(.route-marker) {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  border: 2px solid white;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  font-weight: bold;
  cursor: move;
}

:deep(.start-marker) {
  border-color: #52c41a;
}

:deep(.end-marker) {
  border-color: #fa541c;
}

:deep(.mid-marker) {
  width: 16px;
  height: 16px;
  border-color: #409eff;
}

:deep(.marker-text) {
  font-size: 12px;
  line-height: 1;
}

:deep(.location-info-window) {
  padding: 8px;
  min-width: 200px;
}

:deep(.location-info-window h4) {
  margin: 0 0 8px 0;
  color: #333;
  font-size: 14px;
}

:deep(.location-info-window p) {
  margin: 4px 0;
  font-size: 12px;
  color: #666;
}

:deep(.start-badge) {
  color: #52c41a;
  font-weight: bold;
  margin: 4px 0 0 0 !important;
  padding: 2px 6px;
  background: #f6ffed;
  border-radius: 4px;
  display: inline-block;
}

:deep(.end-badge) {
  color: #fa541c;
  font-weight: bold;
  margin: 4px 0 0 0 !important;
  padding: 2px 6px;
  background: #fff2e8;
  border-radius: 4px;
  display: inline-block;
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